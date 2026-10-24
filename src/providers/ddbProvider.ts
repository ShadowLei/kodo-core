import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { DataNode } from "../nodes";
import { QueryNode } from "../nodes/queryNode";
import {
    BOperator,
    QueryExpression,
    QueryExpressionObject,
    QueryOnValue,
    ROperator,
    isQueryExpressionKey,
    isQueryOnValue,
} from "../expressions";
import { IDataProvider } from "./iDataProvider";
import { generateHashCode, isNullOrUndefined } from "../utils";

/*
 * DDBProvider
 * -----------
 * A kodo-core data-provider backed by AWS DynamoDB.
 *
 * DynamoDB exposes two ways to read items: `query` (key based) and `scan` (full
 * table walk). Because `scan` is slow & expensive, this provider intentionally
 * ONLY supports key based `query` reads:
 *   - the partition key MUST be matched with equality (`==` / `===` / `IN`)
 *   - the sort key (when the table has one) MAY be further constrained
 *
 * Any query that would require a `scan` (e.g. missing partition key, or a
 * partition key that is OR-ed / compared with a non-equality operator) throws
 * an exception instead.
 */

export interface DDBTable {
    // the DynamoDB table name
    tableName: string;
    // the partition (HASH) key attribute name
    pk: string;
    // the sort (RANGE) key attribute name (only when the table defines one)
    sk?: string;
}

// keyed by the kodo namespace (the class name, e.g. "Order" / "Payment")
export type DDBTableMap = Record<string, DDBTable>;

type DDBKeyOp = "=" | ">" | ">=" | "<" | "<=";

// an atomic condition: attribute `attr` compared with `op` against `val`
interface DDBCond {
    id: number;
    attr: string;
    op: ROperator;
    val: any;
}

// a boolean combination of atomic conditions (mirrors $with / $where)
interface DDBBool {
    op: BOperator;
    items: (DDBCond | DDBBool)[];
}

interface KeyInfo {
    pkVals: any[] | null;
    skConds: { op: DDBKeyOp; val: any }[];
    consumed: Set<number>;
    pkFound: boolean;
    pkInvalid: boolean;
}

interface BuildCtx {
    names: Record<string, string>;   // placeholder -> attr name (DynamoDB format)
    values: Record<string, any>;     // value placeholder -> value
    attrIdx: Record<string, string>; // attr name -> placeholder (internal lookup)
    nameSeq: { n: number };
    valueSeq: { n: number };
    consumed: Set<number>;
}

export class DDBProvider implements IDataProvider {
    private condSeq = 0;

    constructor(
        private client: DynamoDBDocumentClient,
        private tables: DDBTableMap,
    ) { }

    // ---------- expression normalisation ----------

    private isCond(item: DDBCond | DDBBool): item is DDBCond {
        return (item as DDBCond).attr !== undefined;
    }

    private toBool<T>(expr: QueryExpressionObject<T>): DDBBool {
        const isAnd = (expr.$with || "&&") === "&&";
        const op: BOperator = isAnd ? "&&" : "||";
        const items: (DDBCond | DDBBool)[] = [];

        for (const key in expr) {
            if (isQueryExpressionKey(key)) { continue; }

            const raw = expr[key];
            if (isQueryOnValue(raw)) {
                const v = raw as QueryOnValue<T, keyof T>;
                items.push({ id: this.condSeq++, attr: key, op: (v.$op || "==") as ROperator, val: v.$val });
            } else {
                items.push({ id: this.condSeq++, attr: key, op: "==" as ROperator, val: raw });
            }
        }

        for (const w of (expr.$where || [])) {
            if (typeof w === "function") {
                throw new Error("DDB: function predicate is not supported.");
            }
            items.push(this.toBool(w));
        }

        return { op, items };
    }

    // ---------- key extraction ----------

    private isKeyOp(op: ROperator): boolean {
        return op === "==" || op === "===" || op === ">" || op === ">=" || op === "<" || op === "<=";
    }

    private normalizeKeyOp(op: ROperator): DDBKeyOp {
        switch (op) {
            case "==":
            case "===": return "=";
            case ">": return ">";
            case ">=": return ">=";
            case "<": return "<";
            case "<=": return "<=";
            default:
                throw new Error(`DDB: op '${op}' is not valid for a key condition.`);
        }
    }

    // walk the boolean tree; only conditions reachable through a pure `&&` path
    // are eligible to drive the key condition (partition + sort key)
    private walkKey(node: DDBBool, table: DDBTable, andBound: boolean, ctx: KeyInfo): void {
        const childAndBound = andBound && node.op === "&&";

        for (const item of node.items) {
            if (this.isCond(item)) {
                const c = item;

                if (c.attr === table.pk) {
                    ctx.pkFound = true;
                    if (childAndBound) {
                        if (c.op === "==" || c.op === "===") {
                            ctx.pkVals = ctx.pkVals || [];
                            ctx.pkVals.push(c.val);
                            ctx.consumed.add(c.id);
                        } else if (c.op === "IN" && Array.isArray(c.val)) {
                            ctx.pkVals = ctx.pkVals || [];
                            ctx.pkVals.push(...c.val);
                            ctx.consumed.add(c.id);
                        } else {
                            ctx.pkInvalid = true;
                        }
                    } else {
                        ctx.pkInvalid = true;
                    }
                } else if (table.sk && c.attr === table.sk) {
                    if (childAndBound && this.isKeyOp(c.op)) {
                        ctx.skConds.push({ op: this.normalizeKeyOp(c.op), val: c.val });
                        ctx.consumed.add(c.id);
                    }
                }
            } else {
                this.walkKey(item, table, childAndBound, ctx);
            }
        }
    }

    private extractKey(root: DDBBool, table: DDBTable): KeyInfo {
        const ctx: KeyInfo = {
            pkVals: null,
            skConds: [],
            consumed: new Set<number>(),
            pkFound: false,
            pkInvalid: false,
        };
        this.walkKey(root, table, true, ctx);
        return ctx;
    }

    // ---------- expression string building ----------

    private attrName(attr: string, ctx: BuildCtx): string {
        let p = ctx.attrIdx[attr];
        if (!p) {
            p = `#a${ctx.nameSeq.n++}`;
            ctx.attrIdx[attr] = p;
            ctx.names[p] = attr;
        }
        return p;
    }

    private valRef(value: any, ctx: BuildCtx): string {
        const p = `:v${ctx.valueSeq.n++}`;
        ctx.values[p] = value;
        return p;
    }

    private translateCond(c: DDBCond, ctx: BuildCtx): string {
        const name = this.attrName(c.attr, ctx);

        if (isNullOrUndefined(c.val)) {
            switch (c.op) {
                case "==":
                case "===": return `attribute_not_exists(${name})`;
                case "!=":
                case "!==": return `attribute_exists(${name})`;
                default:
                    throw new Error(`DDB: op '${c.op}' cannot be used with a null value.`);
            }
        }

        switch (c.op) {
            case "==":
            case "===": return `${name} = ${this.valRef(c.val, ctx)}`;
            case "!=":
            case "!==": return `${name} <> ${this.valRef(c.val, ctx)}`;
            case ">":
            case ">=":
            case "<":
            case "<=": return `${name} ${c.op} ${this.valRef(c.val, ctx)}`;
            case "IN": {
                if (!Array.isArray(c.val) || c.val.length === 0) {
                    throw new Error(`DDB: IN requires a non-empty array value.`);
                }
                const refs = c.val.map(v => this.valRef(v, ctx));
                return `${name} IN (${refs.join(", ")})`;
            }
            case "!IN": {
                if (!Array.isArray(c.val) || c.val.length === 0) {
                    throw new Error(`DDB: !IN requires a non-empty array value.`);
                }
                const refs = c.val.map(v => this.valRef(v, ctx));
                return `NOT (${name} IN (${refs.join(", ")}))`;
            }
            default:
                throw new Error(`DDB: unsupported op '${c.op}'.`);
        }
    }

    // translate the remaining (non-key) conditions into a FilterExpression
    private translateFilter(node: DDBBool, ctx: BuildCtx): string | null {
        const parts: string[] = [];

        for (const item of node.items) {
            if (this.isCond(item)) {
                if (ctx.consumed.has(item.id)) { continue; }
                parts.push(this.translateCond(item, ctx));
            } else {
                const sub = this.translateFilter(item, ctx);
                if (sub) { parts.push(sub); }
            }
        }

        if (parts.length === 0) { return null; }
        if (parts.length === 1) { return parts[0]; }

        const joiner = (node.op === "&&") ? " AND " : " OR ";
        return `(${parts.join(joiner)})`;
    }

    // ---------- query building ----------

    private buildQueryInput(table: DDBTable, root: DDBBool, keyInfo: KeyInfo, pkVal: any): QueryCommandInput {
        const ctx: BuildCtx = {
            names: {},
            values: {},
            attrIdx: {},
            nameSeq: { n: 0 },
            valueSeq: { n: 0 },
            consumed: keyInfo.consumed,
        };

        const pkName = this.attrName(table.pk, ctx);
        let keyExpr = `${pkName} = ${this.valRef(pkVal, ctx)}`;

        for (const sc of keyInfo.skConds) {
            const skName = this.attrName(table.sk!, ctx);
            keyExpr += ` AND ${skName} ${sc.op} ${this.valRef(sc.val, ctx)}`;
        }

        const filterExpr = this.translateFilter(root, ctx);

        const input: QueryCommandInput = {
            TableName: table.tableName,
            KeyConditionExpression: keyExpr,
            ExpressionAttributeNames: ctx.names,
            ExpressionAttributeValues: ctx.values,
        };
        if (filterExpr) {
            input.FilterExpression = filterExpr;
        }

        return input;
    }

    // ---------- IDataProvider ----------

    async lookup<T>(qNode: QueryNode<T>): Promise<DataNode<any>[]> {
        const table = this.tables[qNode.$ns];
        if (!table) {
            throw new Error(`DDB: no table configured for namespace '${qNode.$ns}'.`);
        }

        if (typeof qNode.expression === "function") {
            throw new Error(`DDB: function predicate is not supported (would require a scan).`);
        }

        const root = this.toBool(qNode.expression);
        const keyInfo = this.extractKey(root, table);

        if (!keyInfo.pkFound) {
            throw new Error(`DDB: query on '${table.tableName}' requires the partition key '${table.pk}' to be specified. Scan is not supported.`);
        }
        if (keyInfo.pkInvalid || !keyInfo.pkVals || keyInfo.pkVals.length === 0) {
            throw new Error(`DDB: partition key '${table.pk}' must be matched with equality (==/===/IN) and cannot be OR-ed or range-compared.`);
        }

        // dedupe in case the same value was matched more than once
        const pkVals = Array.from(new Set(keyInfo.pkVals));

        // `IN` on the partition key expands into several parallel queries (still query, not scan)
        const inputs = pkVals.map(v => this.buildQueryInput(table, root, keyInfo, v));
        const results = await Promise.all(inputs.map(i => this.client.send(new QueryCommand(i))));

        const items = results.flatMap(r => r.Items || []);

        return items.map(m => {
            const node = new DataNode<T>();
            node.$fromQN = qNode;
            node.$ns = qNode.$ns;
            node.data = m as Partial<T>;
            node.$id = m.id ?? m[table.pk] ?? generateHashCode(m);
            return node;
        });
    }
}
