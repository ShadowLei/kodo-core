import { LinkOperator } from "../_define";

// export type LinkOn<TFrom, TTo> = {
//     $from?: keyof TFrom,
//     $op?: LinkOperator,
//     $to?: keyof TTo
// };

// export type LinkExpressionWhere<TFrom, TTo> = {
//     // $with?: BOperator;
//     $where?: Array<LinkExpression<TFrom, TTo>>;
// };

export type LinkExpressionPredicate<TFrom, TTo> = (from: Partial<TFrom>) => Partial<TTo>;

export type LinkExpressionObject<TFrom, TTo> = {
    $from?: keyof TFrom,
    $op?: LinkOperator,
    $to?: keyof TTo,
    $where?: Array<LinkExpression<TFrom, TTo>>;
}

// export type LinkExpressionObject<TFrom, TTo> = LinkExpressionWhere<TFrom, TTo> & LinkOn<TFrom, TTo>;

export type LinkExpression<TFrom, TTo> = LinkExpressionObject<TFrom, TTo> | LinkExpressionPredicate<TFrom, TTo>;

export function isLinkExpressionKey(key: string): boolean {
    return (key === "$with" || key === "$where");
}
