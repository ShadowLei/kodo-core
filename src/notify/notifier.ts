import { DataNode } from "../nodes";
import { NotificationRule } from "./rule";

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

export class Notifier {
    private notifier: INotifier[];

    constructor() {
        this.notifier = [];
    }

    register(n: INotifier) {
        this.notifier.push(n);
    }

    async notify(rule: NotificationRule, nodes: DataNode<any>[]): Promise<any> {

        // console.log(rule.notify?.channels);

        let channels = rule.notify?.channels || [];
        let ns = this.notifier.filter(m => channels.some(n => n === m.name));

        if (ns.length <= 0) { return; }

        return Promise.allSettled(ns.map(n => n.notify(rule, nodes)));
    }
}
