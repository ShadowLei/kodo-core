import { describe, test } from 'bun:test';
import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestData } from "./_ddb_link";
import { strictEqual } from "../_common";

let flatKodo = new Kodo("ddb-filter-flat", { cache: false, tierLimit: 1 });
initKodoTestData(flatKodo);

describe("Filter - 数字比较 (amount)", () => {
    // Payment: p3-1(amount=1300), p3-2(amount=2500), orderid=o3

    test("amount == 1300", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "==", $val: 1300 } }
        });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-1"), true);
    });

    test("amount === 1300", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "===", $val: 1300 } }
        });

        strictEqual(nodes.length, 1);
    });

    test("amount != 1300", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "!=", $val: 1300 } }
        });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-2"), true);
    });

    test("amount !== 1300", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "!==", $val: 1300 } }
        });

        strictEqual(nodes.length, 1);
    });

    test("amount > 1300", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: ">", $val: 1300 } }
        });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-2"), true);
    });

    test("amount >= 1300", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: ">=", $val: 1300 } }
        });

        strictEqual(nodes.length, 2);
    });

    test("amount < 1300 (无匹配)", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "<", $val: 1300 } }
        });

        strictEqual(nodes.length, 0);
    });

    test("amount <= 1300", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "<=", $val: 1300 } }
        });

        strictEqual(nodes.length, 1);
    });

    test("amount > 2500 (边界, 空)", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: ">", $val: 2500 } }
        });

        strictEqual(nodes.length, 0);
    });

    test("amount <= 2500 (边界, 全匹配)", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "<=", $val: 2500 } }
        });

        strictEqual(nodes.length, 2);
    });
});

describe("Filter - 字符串比较 (logid / operator)", () => {
    test("logid == P12345 (o3)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", logid: { $op: "==", $val: "P12345" } }
        });

        strictEqual(nodes.length, 1);
    });

    test("logid == wrong (无匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", logid: { $op: "==", $val: "wrong" } }
        });

        strictEqual(nodes.length, 0);
    });

    test("logid != P12345 (无匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", logid: { $op: "!=", $val: "P12345" } }
        });

        strictEqual(nodes.length, 0);
    });

    test("operator == Shadow (o3)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", operator: { $op: "==", $val: "Shadow" } }
        });

        strictEqual(nodes.length, 1);
    });

    test("operator == Allen (o3 不匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", operator: { $op: "==", $val: "Allen" } }
        });

        strictEqual(nodes.length, 0);
    });
});
