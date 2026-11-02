import { DataNode } from "../nodes";
import { evaluateRule, RuleViolation } from "./evaluator";
import { INotifier, NoopNotifier } from "./notifier";
import { NotificationRule } from "./rule";

export class NotificationEngine {
    private notifier: INotifier;

    constructor(notifier?: INotifier) {
        this.notifier = notifier ?? new NoopNotifier();
    }

    async check(rules: NotificationRule[], nodes: DataNode<any>[]): Promise<RuleViolation[]> {
        const violations: RuleViolation[] = [];

        for (const rule of rules) {
            const violation = evaluateRule(rule, nodes);
            if (violation) {
                violations.push(violation);
                await this.notifier.notify(rule, violation.violated);
            }
        }

        return violations;
    }
}
