import { QueryExpression } from "../expressions";

export type RuleExpect = "all" | "any" | "none";

export interface NotificationRule<T = any> {
    id: string;
    description?: string;
    enabled?: boolean;
    target?: {
        $ns?: string;
    };
    expect?: RuleExpect;
    match: QueryExpression<T>;
    notify?: {
        channels?: string[];
        message?: string;
    };
}
