import { DataNode } from "../nodes";
import { NotificationRule } from "./rule";

export interface INotifier {
    notify(rule: NotificationRule, violated: DataNode<any>[]): Promise<void> | void;
}

export class NoopNotifier implements INotifier {
    async notify(rule: NotificationRule, violated: DataNode<any>[]): Promise<void> {
        // no-op: concrete notification channels (email, webhook, ...) are deferred.
    }
}
