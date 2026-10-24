import { describe, test, expect } from 'bun:test';
import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestData } from "./_ddb_link";
import { strictEqual } from "../_common";

let kodo = new Kodo("ddb-in", { cache: false, tierLimit: 3 });
initKodoTestData(kodo);

let flatKodo = new Kodo("ddb-in-flat", { cache: false, tierLimit: 1 });
initKodoTestData(flatKodo);

describe("IN (partition key 批量)", () => {
    test("Order.id IN [o1, o2]", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: { id: { $op: "IN", $val: ["o1", "o2"] } }
        });

        strictEqual(nodes.length, 3);
        strictEqual(!!nodes.find(m => m.$ns === "Order" && m.$id === "o1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Order" && m.$id === "o2"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p1-1"), true);
    });

    test("Order.id IN [o1, o2, o3, o4] (全部)", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: { id: { $op: "IN", $val: ["o1", "o2", "o3", "o4"] } }
        });
        strictEqual(nodes.length, 11);
    });

    test("Order.id IN [o3] (单值)", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: { id: { $op: "IN", $val: ["o3"] } }
        });
        strictEqual(nodes.length, 6);
    });

    test("Order.id IN [o1, o999] (部分存在)", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: { id: { $op: "IN", $val: ["o1", "o999"] } }
        });
        strictEqual(nodes.length, 2);
        strictEqual(!!nodes.find(m => m.$ns === "Order" && m.$id === "o1"), true);
    });

    test("Order.id IN [不存在的值] (空)", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: { id: { $op: "IN", $val: ["o999", "o888"] } }
        });
        strictEqual(nodes.length, 0);
    });

    test("Order.id IN [] (空数组 → 抛异常)", async () => {
        expect(
            kodo.explore<Order>({ $ns: "Order", expression: { id: { $op: "IN", $val: [] } } })
        ).rejects.toThrow(/partition key/);
    });
});

describe("IN / !IN (filter, 非 key 字段)", () => {
    test("amount IN [1300, 2500]", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "IN", $val: [1300, 2500] } }
        });
        strictEqual(nodes.length, 2);
    });

    test("amount IN [1300]", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "IN", $val: [1300] } }
        });
        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-1"), true);
    });

    test("amount IN [999] (无匹配)", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "IN", $val: [999] } }
        });
        strictEqual(nodes.length, 0);
    });

    test("amount !IN [1300]", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "!IN", $val: [1300] } }
        });
        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-2"), true);
    });

    test("amount !IN [1300, 2500] (全排除)", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "!IN", $val: [1300, 2500] } }
        });
        strictEqual(nodes.length, 0);
    });
});
