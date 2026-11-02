import { DataNode } from "../nodes";
import { match } from "../utils/expressionMatcher";
import { NotificationRule } from "./rule";

export interface RuleViolation {
    rule: NotificationRule;
    violated: DataNode<any>[];
}

export function evaluateRule<T = any>(rule: NotificationRule<T>, nodes: DataNode<any>[]): RuleViolation | null {
    // Disabled rules are skipped and never produce a violation.
    if (rule.enabled === false) {
        return null;
    }

    const expect = rule.expect ?? "all";

    // Optional target namespace: only evaluate nodes in that namespace.
    const ns = rule.target?.$ns;
    const scoped = ns ? nodes.filter(n => n.$ns === ns) : nodes;

    // Evaluate the predicate on each node's data. "defer" is undecidable and ignored.
    const results = scoped.map(n => match<T>(rule.match, n.data));

    let violated: DataNode<any>[] = [];

    switch (expect) {
        case "all":
            // Fails when any node does not satisfy the predicate.
            violated = scoped.filter((_, i) => results[i] === false);
            break;
        case "any":
            // Fails when no node satisfies the predicate (including an empty set).
            // No single offending node: the failure is the absence of a match.
            violated = scoped;
            break;
        case "none":
            // Fails when any node satisfies the predicate.
            violated = scoped.filter((_, i) => results[i] === true);
            break;
    }

    // Determine whether the rule passes (matches) per quantifier.
    let passes: boolean;
    switch (expect) {
        case "all":
            passes = !scoped.some((_, i) => results[i] === false);
            break;
        case "any":
            passes = scoped.some((_, i) => results[i] === true);
            break;
        case "none":
            passes = !scoped.some((_, i) => results[i] === true);
            break;
        default:
            passes = true;
    }

    return passes ? null : { rule, violated };
}
