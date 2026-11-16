import { DataNode } from "../nodes";
import { NotificationRule } from "./_ruleDefine";

export interface INotifier {
    name: string;
    notify(rule: NotificationRule, violated: DataNode<any>[]): Promise<void> | void;
}

export class ConsoleNotifier implements INotifier {
    name: string;

    constructor() {
        this.name = "console";
    }

    notify(rule: NotificationRule, violated: DataNode<any>[]): Promise<void> | void {
        
        let id = rule.id || "rule";
        let msg = rule.notify?.message || "message";
        console.error(`--============ ${id} | ${msg} ============--`);
        console.error(`-- rule (${this.name}}) --`);
        console.log(rule);
        console.error(`-- data (${violated.length}) --`);
        console.log(violated);
    }
}
