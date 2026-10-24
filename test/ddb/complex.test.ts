import { describe, test } from 'bun:test';
import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestData } from "./_ddb_link";
import { strictEqual } from "../_common";

let flatKodo = new Kodo("ddb-complex-flat", { cache: false, tierLimit: 1 });
initKodoTestData(flatKodo);

let kodo = new Kodo("ddb-complex", { cache: false, tierLimit: 3 });
initKodoTestData(kodo);

describe("多条件组合 (pk + filter AND)", () => {
    test("Order.id=o3 && logid=P12345 && operator=Shadow", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", logid: "P12345", operator: "Shadow" }
        });
        strictEqual(nodes.length, 1);
    });

    test("Order.id=o3 && logid=P12345 && operator=wrong (不匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", logid: "P12345", operator: "wrong" }
        });
        strictEqual(nodes.length, 0);
    });
});

describe("pk + sort key + filter 组合", () => {
    test("orderid=o3 && id>=p3-1 && amount>=1300", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: {
                orderid: "o3",
                id: { $op: ">=", $val: "p3-1" },
                amount: { $op: ">=", $val: 1300 }
            }
        });
        strictEqual(nodes.length, 2);
    });

    test("orderid=o3 && id>=p3-1 && amount<2000", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: {
                orderid: "o3",
                id: { $op: ">=", $val: "p3-1" },
                amount: { $op: "<", $val: 2000 }
            }
        });
        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-1"), true);
    });
});

describe("$where 嵌套 (AND)", () => {
    test("id=o3 && $where[logid=P12345]", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", $where: [{ logid: "P12345" }] }
        });
        strictEqual(nodes.length, 1);
    });

    test("id=o3 && $where[logid=wrong] (不匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", $where: [{ logid: "wrong" }] }
        });
        strictEqual(nodes.length, 0);
    });

    test("id=o3 && $where[$where[logid=P12345]] (多级嵌套)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", $where: [{ $where: [{ logid: "P12345" }] }] }
        });
        strictEqual(nodes.length, 1);
    });
});

describe("$where 嵌套 (OR)", () => {
    test("id=o3 && $where[logid=xxx || operator=Shadow]", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: {
                id: "o3",
                $where: [{ $with: "||", logid: "xxx", operator: "Shadow" }]
            }
        });
        strictEqual(nodes.length, 1);
    });

    test("id=o3 && $where[logid=xxx || operator=yyy] (都不匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: {
                id: "o3",
                $where: [{ $with: "||", logid: "xxx", operator: "yyy" }]
            }
        });
        strictEqual(nodes.length, 0);
    });
});

describe("partition key IN + filter", () => {
    test("id IN [o3,o4] && logid=P12345", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: { id: { $op: "IN", $val: ["o3", "o4"] }, logid: "P12345" }
        });
        // o3 + p3-1 + p3-2 + oo3-1 + pd3-1 + pd3-2 + o4 + p4-1 = 8
        strictEqual(nodes.length, 8);
    });

    test("id IN [o1,o2,o3,o4] && operator != null", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: {
                id: { $op: "IN", $val: ["o1", "o2", "o3", "o4"] },
                operator: { $op: "!=", $val: null }
            }
        });
        // 只有 o3, o4 的 operator 非 null
        strictEqual(nodes.length, 8);
    });
});

describe("同字段多条件 (amount > && amount <)", () => {
    test("orderid=o3 && amount>1000 && amount<3000", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: {
                orderid: "o3",
                amount: { $op: ">", $val: 1000 },
                $where: [{ amount: { $op: "<", $val: 3000 } }]
            }
        });
        strictEqual(nodes.length, 2);
    });
});
