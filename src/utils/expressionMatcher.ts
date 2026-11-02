import { BOperator, isQueryExpressionKey, QueryExpression, QueryExpressionObject, QueryOn, QueryOnValue, ROperator } from "../expressions";
import { isNullOrUndefined } from "./objectUtil";

//defer means delay to judge
type MatchResult = true | false | "defer";

function compareNull(op: ROperator, val: any, dataVal: any): boolean {
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

function isMatchData(key: string, op: ROperator, opVal: any, data: any): boolean {
    let dataVal = data[key];

    if (isNullOrUndefined(opVal)) {
        return compareNull(op, opVal, dataVal);
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

    throw { key: "expressionMatcher.isMatchData", exp: "Not implemented yet." };
}

function assumeMatchList(matchList: MatchResult[], bVal: boolean): MatchResult {
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

function isAllMatchWith(con: BOperator, matchList: MatchResult[]): MatchResult {
    if (matchList.length <= 0) {
        return "defer";
    }

    if (con === "&&") {
        let rtn = assumeMatchList(matchList, false);
        return rtn;
    } else if (con === "||") {
        let rtn = assumeMatchList(matchList, true);
        return rtn;
    } else {
        throw { key: "expressionMatcher.isAllMatchWith", exp: `QueryCondition ${con} not allowed.` };
    }
}

function matchOnData<T>(where: QueryExpressionObject<T>, data: any): MatchResult {
    let con: BOperator = where.$with || "&&";
    let isAnd = (con === "&&");
    let matchList: boolean[] = [];

    for (let key in where as QueryOn<T>) {
        if (isQueryExpressionKey(key)) { continue; }

        let val: any = where[key];

        let match: boolean = false;

        if (typeof val === "object") {
            let theVal = val as QueryOnValue<T, keyof T>;

            match = isMatchData(key, theVal.$op, theVal.$val, data);
        } else {
            match = isMatchData(key, "==", val, data);
        }

        matchList.push(match);

        if (!match && isAnd) { return false; }
    }

    return isAllMatchWith(con, matchList);
}

export function match<T>(expression: QueryExpression<T>, data: any): MatchResult {

    let matchList: MatchResult[] = [];

    if (typeof expression === "function") {
        return expression(data);
    }

    let con: BOperator = expression.$with || "&&";
    let isAnd = (con === "&&");

    let matched = matchOnData(expression, data);
    if (!matched && isAnd) { return false; }

    matchList.push(matched);

    if (expression.$where?.length > 0) {
        expression.$where.every(w => {
            let m = match<T>(w, data);
            matchList.push(m);

            //break:
            if (!matched && isAnd) { return false; }

            return true;
        });
    }

    let rtn = isAllMatchWith(con, matchList);
    return rtn;
}
