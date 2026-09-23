import { DataNode } from "../nodes";
import { QueryNode } from "../nodes/queryNode";
import { QueryExpression, ROperator, BOperator, isQueryExpressionKey, QueryOn, QueryOnValue, QueryExpressionObject, isQueryOnValue } from "../expressions";
import { IDataProvider } from "./iDataProvider";
import { generateHashCode, isNullOrUndefined } from "../utils";
import { And, Between, DataSource, Equal, FindOperator, FindOptionsWhere, ILike, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, ObjectLiteral, Or, SelectQueryBuilder } from "typeorm";


export class TypeOrmProvider implements IDataProvider {
    constructor(private ds: DataSource) {
    }

    private mapOperator(refIdx: number, op: ROperator, key: string, val: any): {exp: string, val: ObjectLiteral} {
        op ||= "==";

        let keyRef = `${key}${refIdx}`;
        
        switch (op) {
            case "IN": return {exp: `${key} IN (:...${keyRef})`, val: {[keyRef]: val}};
            case "!IN": return {exp: `${key} NOT IN (:...${keyRef})`, val: {[keyRef]: val}};
            case "==":
            case "===": return (isNullOrUndefined(val) ?
                            {exp: `${key} IS NULL`, val: null} :
                            {exp: `${key} = :${keyRef}`, val: {[keyRef]: val}})
            case "!=":
            case "!==": return (isNullOrUndefined(val) ?
                            {exp: `${key} IS NOT NULL`, val: null} :
                            {exp: `${key} <> :${keyRef}`, val: {[keyRef]: val}})
            case "<":  return {exp: `${key} < :${keyRef}`, val: {[keyRef]: val}};
            case "<=": return {exp: `${key} <= :${keyRef}`, val: {[keyRef]: val}};
            case ">":  return {exp: `${key} > :${keyRef}`, val: {[keyRef]: val}};
            case ">=": return {exp: `${key} >= :${keyRef}`, val: {[keyRef]: val}};
            // case "LIKE":  return Like(val);
            // case "ILIKE": return ILike(val);
            // case "NULL":  return IsNull();
            // case "NNULL": return Not(IsNull());
            // case "BETWEEN": return Between(val[0], val[1]);
            default:
                throw new Error(`TypeOrm: Unsupported op: ${op}`)
        }
    }

    private queryOnData<T>(refIdx: number, where: QueryExpressionObject<T>): {
        refIdx: number,
        where: {exp: string, val?: ObjectLiteral}[]
     } {
        let rtn: {exp: string, val?: ObjectLiteral}[] = [];

        for (let key in where) {
            if (isQueryExpressionKey(key)) { continue; }

            let whereVal = where[key];

            // let exp: FindOperator<T> = null;

            if (isQueryOnValue(whereVal)) {
                let theVal = whereVal as QueryOnValue<T, keyof T>;
                // console.warn(`*** Try valid: ${isNullOrUndefined(theVal.$val)}`);
                let expVal = this.mapOperator(++refIdx, theVal.$op, key, theVal.$val);
                rtn.push(expVal);
            } else {
                // console.warn(`*** Try valid: ${isNullOrUndefined(val)}`);
                let expVal = this.mapOperator(++refIdx, "==", key, whereVal);
                rtn.push(expVal);
            }
        }

        return {
            refIdx: refIdx,
            where: rtn
        };
    }

    private mergeQueryItems<T>(matchList: FindOptionsWhere<T>[], condition: BOperator): FindOptionsWhere<T> {
        if (matchList.length === 0) { throw new Error("TypeOrm: can't find *"); }   //TBD: we allow but just to avoid error
        if (matchList.length === 1) { return matchList[0]; }
        else if (matchList.length >= 2) {
            let ke = matchList as FindOperator<T>[];
            return ((condition === "&&") ? And(...ke) as any : Or(...ke) as any);
        } else {
            throw new Error("TypeOrm: shouldn't be here.");
        }
    }

    private query<T>(refIdx: number, queryBuilder: SelectQueryBuilder<ObjectLiteral>, expression: QueryExpression<T>): {
        refIdx: number,
        queryBuilder: SelectQueryBuilder<ObjectLiteral>
    } {
        if (typeof expression === "function") {
            throw new Error("TypeOrm Express Match: Not implement yet.");
        }

        // console.log("===== ======")
        // console.log(expression);

        const isAnd = (expression.$with || "&&");

        //1. find on data
        let dataRtn = this.queryOnData<T>(++refIdx, expression);
        refIdx = dataRtn.refIdx;

        for (const item of dataRtn.where) {
            if (isAnd) {
                queryBuilder = queryBuilder.andWhere(item.exp, item.val);
            } else {
                queryBuilder = queryBuilder.orWhere(item.exp, item.val);
            }
        }

        let matchList: {exp: string, val: ObjectLiteral}[] = [];

        //2. find on sub-expression-where
        const where = expression.$where || [];
        for (const whereSub of where) {
            if (typeof whereSub === "function") { throw new Error("TypeOrm Express Condition: Not implement yet."); }

            let queryRtn = this.query<T>(refIdx, queryBuilder, whereSub);
            refIdx = queryRtn.refIdx;
            queryBuilder = queryRtn.queryBuilder;
        }

        return {
            refIdx: refIdx,
            queryBuilder: queryBuilder
        };

        //3. combine & return
        // if (matchList.length === 0) { throw new Error("TypeOrm: can't find *"); }   //TBD: we allow but just to avoid error
        // if (matchList.length === 1) { return matchList[0]; }
        // else if (matchList.length >= 2) {
        //     let ke = matchList as FindOperator<T>[];
        //     return ((condition === "&&") ? And(...ke) as any : Or(...ke) as any);
        // } else {
        //     throw new Error("TypeOrm: shouldn't be here.");
        // }
    }

    async lookup<T>(qNode: QueryNode<T>): Promise<DataNode<any>[]> {

        // console.log("===== lookup =====");
        // console.log(qNode.expression);
        
        if (!this.ds.isInitialized) {
            await this.ds.initialize();
        }
        const repo = this.ds.getRepository(qNode.$ns);

        let queryBuilder = repo.createQueryBuilder();
        let queryRtn = this.query<T>(0, queryBuilder, qNode.expression);

        // console.warn(ormQuery);
        let list = await queryRtn.queryBuilder.getMany();

        // AND 逻辑：直接放一个对象里
        // repo.find({
        //     where: {
        //         orderid: "o3",
        //         id: "p3-2"
        //     }
        // });

        // // 如果是 OR 逻辑：用数组
        // repo.find({
        //     where: [
        //         { orderid: "o3" },
        //         { id: "p3-2" }
        //     ]
        // });
        
        //convert to data node
        let rtn: DataNode<T>[] = list.map(m => {
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
