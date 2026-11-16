
import { DataNode } from "./nodes";
import { INotifier, isCEL, NotificationRule, QueryMatch } from "./notify";
import { Celer } from "./notify/celer";
import { match } from "./utils/expressionMatcher";

export interface RuleViolation {
    rule: NotificationRule;
    violated: DataNode<any>[];
}

export class KodoNotifier {
    private notifier: INotifier[];

    constructor(private opt?: { celWrap?: boolean }) {
        this.opt = Object.assign({ celWrap: true }, this.opt);
        this.notifier = [];
    }

    registerNotifier(n: INotifier) {
        this.notifier.push(n);
    }

    private async notify(rule: NotificationRule, nodes: DataNode<any>[]): Promise<any> {
        let channels = rule.notify?.channels || [];
        let ns = this.notifier.filter(m => channels.some(n => n === m.name));

        if (ns.length <= 0) { return false; }

        await Promise.allSettled(ns.map(n => n.notify(rule, nodes)));
        return true;
    }

    private evaluate<T>(rule: NotificationRule<T>, nodes: DataNode<any>[]): RuleViolation | null {
        // Disabled rules are skipped and never produce a violation.
        if (rule.active === false) {
            return null;
        }

        if (isCEL(rule.matchExpression)) {
            let rtn = new Celer(nodes, this.opt).evaluate(rule.matchExpression as string);
            return rtn ? null : { rule, violated: nodes };
        }

        const queryMatch = rule.matchExpression as QueryMatch<T>;

        // Optional target namespace: only evaluate nodes in that namespace.
        const scoped = queryMatch.$ns ? nodes.filter(n => n.$ns === queryMatch.$ns) : nodes;

        // Evaluate the predicate on each node's data. "defer" is undecidable and ignored.
        const results = scoped.map(n => match<T>(queryMatch.match, n.data));

        let violated: DataNode<any>[] = [];

        switch (queryMatch.expect) {
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
        switch (queryMatch.expect) {
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

    validateOnly(rules: NotificationRule[], nodes: DataNode<any>[]): RuleViolation[] {
        const violations: RuleViolation[] = [];

        for (const rule of rules) {
            const violation = this.evaluate(rule, nodes);
            if (violation) {
                violations.push(violation);
            }
        }

        return violations;
    }

    async validate(rules: NotificationRule[], nodes: DataNode<any>[]): Promise<RuleViolation[]> {
        const violations: RuleViolation[] = [];

        let notifyTask: Promise<any>[] = []
        for (const rule of rules) {
            const violation = this.evaluate(rule, nodes);
            if (violation) {
                violations.push(violation);
                notifyTask.push(this.notify(rule, violation.violated));
            }
        }

        await Promise.allSettled(notifyTask);
        return violations;
    }
}