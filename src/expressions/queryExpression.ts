import { BOperator, ROperator_Atom, ROperator_Array } from "./_defines";

/*
export interface IObject<T extends ObjectType> {
    type: T
    parameters: ParameterMap[T]
};
type ParameterMap = {
    "==": string
    "IN": string[]
};
export type ObjectType = keyof ParameterMap;
let test: IObject<"IN"> = {
    type: "==",
    parameters: "test"
};
*/

export type QueryOnAtomValue<T, P extends keyof T> = {
    $op?: ROperator_Atom;
    $val: T[P] | null | undefined;
};

export type QueryOnArrayValue<T, P extends keyof T> = {
    $op?: ROperator_Array;
    $val: T[P][];
};

export type QueryOnValue<T, P extends keyof T> = QueryOnAtomValue<T, P> | QueryOnArrayValue<T, P>;

export type QueryOn<T> = {
    [P in keyof T]?: QueryOnValue<T, P> | T[P];
};

export type QueryExpressionWhere<T> = {
    $with?: BOperator;
    $where?: Array<QueryExpression<T>>;
};

export type QueryExpressionPredicate<T> = (item: T) => boolean;

export type QueryExpressionObject<T> = QueryExpressionWhere<T> & QueryOn<T>;

export type QueryExpression<T> = QueryExpressionObject<T> | QueryExpressionPredicate<T>;

export function isQueryExpressionKey(key: string): boolean {
    return (key === "$with" || key === "$where");
}
