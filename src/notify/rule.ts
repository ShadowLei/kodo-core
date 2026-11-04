import { QueryExpression } from "../expressions";

export type RuleExpect = "all" | "any" | "none";

export interface NotificationRule<T = any> {
    id?: string;
    description?: string;
    active?: boolean;
    $ns?: string;
    expect: RuleExpect;
    match: QueryExpression<T>;
    notify?: {
        channels?: string[];
        message?: string;
    };
}
