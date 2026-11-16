import { QueryExpression } from "../expressions";

export type RuleExpect = "all" | "any" | "none";

export type QueryMatch<T> = {
    $ns?: string;
    expect: RuleExpect;
    match: QueryExpression<T>;
}

export interface NotificationRule<T = any> {
    id?: string;
    description?: string;
    active?: boolean;
    matchExpression: QueryMatch<T> | string;
    notify?: {
        channels?: string[];
        message?: string;
    };
}

export function isCEL(matchExpression: QueryMatch<any> | string): boolean {
    return (typeof matchExpression === "string");
}
