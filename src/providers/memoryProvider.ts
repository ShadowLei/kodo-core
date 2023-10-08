import { DataNode } from "../nodes";
import { QueryNode } from "../nodes/queryNode";
import { QueryExpression, ROperator, BOperator, isQueryExpressionKey, QueryOn, QueryOnValue, QueryExpressionObject } from "../expressions";
import { IDataProvider } from "./iDataProvider";
import { generateHashCode, isNullOrUndefined } from "../utils";

//defer means delay to judge
declare type MatchResult = true | false | "defer";

export class MemoryData<T> {
    ns: string;
    val: T;
}

export class MemoryProvider implements IDataProvider {
    private objs: MemoryData<any>[];

    constructor() {
        this.objs = [];
    }

    add<T>(namespace: string, obj: T) {
        this.objs.push({
            ns: namespace,
            val: obj
        });
    }

    private copmareNull(op: ROperator, val: any, dataVal: any): boolean {
        switch (op) {
            case "==":
                return isNullOrUndefined(dataVal);
            case "!=":
                return !isNullOrUndefined(dataVal);
            case "===":
                return (dataVal === val);
            case "!==":
                return (dataVal !== val);
            default:
                return false;
        }
    }

    private isMatchData(key: string, op: ROperator, opVal: any, data: any): boolean {
        let dataVal = data[key];

        if (isNullOrUndefined(opVal)) {
            return this.copmareNull(op, opVal, dataVal);
        }

        op ||= "==";
        switch (op) {
            case "==":
                return (dataVal == opVal);
            case "===":
                return (dataVal === opVal);
            case "!=":
                return (dataVal != opVal);
            case "!==":
                return (dataVal !== opVal);
            case ">":
                return (dataVal > opVal);
            case ">=":
                return (dataVal >= opVal);
            case "<":
                return (dataVal < opVal);
            case "<=":
                return (dataVal <= opVal);
            case "IN":
                if (opVal instanceof Array) {
                    return opVal.some(m => m == dataVal);
                }
                return false;
            case "!IN":
                if (opVal instanceof Array) {
                    return !opVal.some(m => m == dataVal);
                }
                return false;
            default:
                break;
        }
        
        throw { key: "MemoryProvider.isMatchData", exp: "Not implemented yet." };
    }

    private assumeMatchList(matchList: MatchResult[], bVal: boolean): MatchResult {
        let rtn: MatchResult = "defer";

        matchList.every(m => {
            //continue
            if (m === "defer") { return true; }

            if (m === bVal) {
                rtn = bVal;

                return false;   //break;
            } else {
                rtn = !bVal;
            }

            //continue;
            return true;
        });

        return rtn;
    }

    private isAllMatchWith(con: BOperator, matchList: MatchResult[]): MatchResult {
        if (matchList.length <= 0) {
            return "defer";
        }

        if (con === "&&") {
            /*
            let rtn: MatchResult = "defer";
            matchList.every(m => {
                if (m === false) {
                    rtn = false;
                    return false;   //break;
                }

                if (m === true) {
                    rtn = true;
                }

                //continue;
                return true;
            });
            */
            let rtn = this.assumeMatchList(matchList, false);

            return rtn;
        } else if (con === "||") {
            /*
            let rtn: MatchResult = "defer";
            matchList.every(m => {
                if (m === true) {
                    rtn = true;
                    return false;   //break;
                }

                if (m === false) {
                    rtn = false;
                }

                //continue;
                return true;
            });
            */
            
            let rtn = this.assumeMatchList(matchList, true);
            return rtn;
        } else {
            throw { key: "MemoryProvider.isMatchWith", exp: `QueryCondition ${con} not allowed.` };
        }
    }

    private matchOnData<T>(where: QueryExpressionObject<T>, data: any): MatchResult {
        let con: BOperator = where.$with || "&&";
        let isAnd = (con === "&&");
        let matchList: boolean[] = [];

        for (let key in where as QueryOn<T>) {
            if (isQueryExpressionKey(key)) { continue; }

            let val: any = where[key];

            let match: boolean = false;

            if (typeof val === "object") {
                let theVal = val as QueryOnValue<T, keyof T>;

                match = this.isMatchData(key, theVal.$op, theVal.$val, data);
            } else {
                match = this.isMatchData(key, "==", val, data);
            }

            matchList.push(match);

            if (!match && isAnd) { return false; }
        }

        return this.isAllMatchWith(con, matchList);
    }

    private match<T>(expression: QueryExpression<T>, data: any): MatchResult {
        
        let matchList: MatchResult[] = [];

        if (typeof expression === "function") {
            return expression(data);
        }

        let con: BOperator = expression.$with || "&&";
        let isAnd = (con === "&&");

        let matched = this.matchOnData(expression, data);
        if (!matched && isAnd) { return false; }
        
        matchList.push(matched);

        if (expression.$where?.length > 0) {
            expression.$where.every(w => {
                let match = this.match<T>(w, data);
                matchList.push(match);
    
                //break:
                if (!matched && isAnd) { return false; }

                return true;
            });
        }

        let rtn = this.isAllMatchWith(con, matchList);
        return rtn;
    }

    lookup<T>(qNode: QueryNode<T>): DataNode<any>[] {
        //find match
        let list = this.objs.filter(m => {
            if (qNode.$ns !== m.ns) { return false; }

            let rtn = this.match(qNode.expression, m.val);

            //regards the final "defer" as false
            if (rtn === "defer") { return false; }
            else { return rtn; }
        });

        //convert to data node
        let rtn = list.map(m => {
            let node = new DataNode<T>();
            node.$fromQN = qNode;
            node.$ns = m.ns;
            node.data = m.val;
            node.$id = m.val?.id || generateHashCode(m.val);  //TODO here: use hashcode to generate?
            return node;
        });

        return rtn;
    }
}