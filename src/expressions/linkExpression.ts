import { BOperator, LinkOperator, ROperator } from "./_defines";

export type LinkOn<TFrom, TTo> = {
    $from?: keyof TFrom,
    $op?: LinkOperator,
    $to?: keyof TTo
};

export type LinkExpressionWhere<TFrom, TTo> = {
    $with?: BOperator;
    $where?: Array<LinkExpression<TFrom, TTo>>;
};

export type LinkExpression<TFrom, TTo> = LinkExpressionWhere<TFrom, TTo> & LinkOn<TFrom, TTo>;

export function isLinkExpressionKey(key: string): boolean {
    return (key === "$with" || key === "$where");
}
