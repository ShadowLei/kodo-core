import { DataNode } from "../nodes";
import { QueryNode } from "../nodes/queryNode";
import { QueryExpression, ROperator, BOperator, isQueryExpressionKey, QueryOn, QueryOnValue, QueryExpressionObject } from "../expressions";
import { IDataProvider } from "./iDataProvider";
import { generateHashCode, isNullOrUndefined } from "../utils";
import { And, Between, DataSource, FindOperator, ILike, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, Or } from "typeorm";


export class TypeOrmProvider implements IDataProvider {
    constructor(private ds: DataSource) {
    }

    private mapOperator(op: ROperator, val: any): FindOperator<any> {
        op ||= "==";
        
        switch (op) {
            case "IN": return In(val);
            case "!IN": return Not(In(val));
            case "==":
            case "===": return (isNullOrUndefined(val) ? IsNull(): val);
            case "!=":
            case "!==": return (isNullOrUndefined(val) ? Not(IsNull()): Not(val));
            case "<":  return LessThan(val);
            case "<=": return LessThanOrEqual(val);
            case ">":  return MoreThan(val);
            case ">=": return MoreThanOrEqual(val);
            // case "LIKE":  return Like(val);
            // case "ILIKE": return ILike(val);
            // case "NULL":  return IsNull();
            // case "NNULL": return Not(IsNull());
            // case "BETWEEN": return Between(val[0], val[1]);
            default:
                throw new Error(`TypeOrm: Unsupported op: ${op}`)
        }
    }
    
    private queryOnData<T>(where: QueryOn<T>): FindOperator<any>[] {
        let matchList: FindOperator<any>[] = [];
        for (let key in where) {
            if (isQueryExpressionKey(key)) { continue; }

            let val: any = where[key];

            if (typeof val === "object") {
                let theVal = val as QueryOnValue<T, keyof T>;

                let exp = this.mapOperator(theVal.$op, theVal.$val);
                matchList.push(exp);
            } else {
                let exp = this.mapOperator("==", val);
                matchList.push(exp);
            }
        }

        return matchList;
    }

    private query<T>(expression: QueryExpression<T>): FindOperator<any> {
        if (typeof expression === "function") {
            throw new Error("TypeOrm Express Match: Not implement yet.");
        }

        const where = expression.$where || [];
        let matchList: FindOperator<any>[] = [];

        //1. find on data
        let dataMatch = this.queryOnData(expression);
        matchList.push(...dataMatch);

        //2. find on sub-expression-where
        for (const con of where) {
            if (typeof con === "function") { throw new Error("TypeOrm Express Condition: Not implement yet."); }

            matchList.push(this.query(con.$where));
        }

        //3. combine & return
        const con = expression.$with || "&&";
        if (matchList.length === 0) { throw new Error("TypeOrm: can't find *"); }   //TBD: we allow but just to avoid error
        if (matchList.length === 1) { return matchList[0]; }
        else {
            return ((con === "&&") ? And(...matchList) : Or(...matchList));
        }
    }

    async lookup<T>(qNode: QueryNode<T>): Promise<DataNode<any>[]> {
        let ormQuery = this.query(qNode.expression);

        if (!this.ds.isInitialized) {
            this.ds.initialize();
        }
        const repo = this.ds.getRepository(qNode.$ns);
        let list = await repo.find({
            where: ormQuery
        });
        
        //convert to data node
        let rtn = list.map(m => {
            let node = new DataNode<T>();
            node.$fromQN = qNode;
            node.$ns = qNode.$ns;
            node.data = m as Partial<T>;
            node.$id = m.id || generateHashCode(m);
            return node;
        });

        return rtn;
    }
}
