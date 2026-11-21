import { ConsoleNotifier, DataNode, Kodo, NotificationRule } from "../../src";
// import { Order, Payment } from "../_module";
import { initKodoTestExpressionData, initKodoTestData } from "./_orm_link";
import { printNodes, strictEqual, verifyIds } from "../_common";
import { describe, test } from 'bun:test';
import { Environment, evaluate } from "@marcbachmann/cel-js";
import { Order, Payment } from "../_module";
import { decycle, retrocycle } from "json-decycle";

// function rule(overrides: Partial<NotificationRule> = {}): NotificationRule {
//     return { id: "r", $ns: "Payment", match: {}, ...overrides };
// }

// function ids(violated: DataNode<any>[]): (string | number)[] {
//     return violated.map(n => n.$id);
// }

let kodo = new Kodo("my-test-net", {
    cache: false,
    tierLimit: 10,
    recursion: false
});
initKodoTestData(kodo);
// kodo.registerNotifier(new ConsoleNotifier());


// const env = new Environment({ unlistedVariablesAreDyn: true})
//     // .registerType('DataNode', DataNode) // 注册类型
//     // .registerType('Order', Order) // 注册类型
//     // .registerType('Payment', Payment) // 注册类型
//     // .registerVariable('nodes', 'list') // 声明 nodes 是 DataNode 的列表
//     .registerFunction('sum(list<double>): double', (list) => {
//         // 在 JS 层面执行求和，兼容 list 中可能存在的 null/undefined
//         return list.reduce((acc, val) => acc + Number(val || 0), 0);
//     });


const env = new Environment({ unlistedVariablesAreDyn: true})
    .registerFunction('sum(list<double>): double', (list) => {
        // 在 JS 层面执行求和，兼容 list 中可能存在的 null/undefined
        return list.reduce((acc, val) => acc + Number(val || 0), 0);
    });

function wrap(obj: any): any {
    let v = JSON.stringify(obj, decycle());
    return JSON.parse(v, retrocycle());
}

describe("CEL Test", async function () {

    test("cel - 0", async () => {

        // Simple evaluation
        let n1 = evaluate('1 + 2 * 16');
        strictEqual(n1, 33n);

        // Simple evaluation
        let n2 = evaluate('0.1 + 2.0 * 1.2');
        strictEqual(n2, 2.5);
    });

    test("cel - 1", async () => {

        // With context
        const allowed = evaluate(
            '(user.age >= 18) && "admin" in user.roles',
            {user: {age: 30, roles: ['admin', 'user']}}
        );
        strictEqual(allowed, true);
    });


    test("cel - 2", async () => {
        let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        // console.log(nodes[0]["$to"][0]["$id"]);

        nodes = wrap(nodes);
        // console.log(nodes);

        // let payments = nodes.filter(m => m.$ns === "Payment");

        const a0 = env.evaluate('nodes.size() == 6' , {nodes});
        strictEqual(a0, true);

        const a01 = env.evaluate('nodes[0]["$id"]' , {nodes});
        strictEqual(a01, "o3");

        const a1 = env.evaluate('nodes[0]["$to"][0]["$id"] == "p3-1"' , {nodes: nodes});
        strictEqual(a1, true);

        const total = env.evaluate(
            'sum(nodes.filter(n, n["$ns"] == "Payment").map(n, double(n.data.amount)))',
            { nodes }
            );
        strictEqual(total, 1300 + 2500);
    });
});
