import { describe, test, expect } from 'bun:test';
import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestData } from "./_ddb_link";
import { strictEqual } from "../_common";

// 完整递归（从 Order 出发 tierLimit=3 可拿到全量节点，且不会触发反向链接的缺 pk scan）
let kodo = new Kodo("ddb-eq", { cache: false, tierLimit: 3 });
initKodoTestData(kodo);

// 仅第一层：用于 sort key 等基础查询，避免递归干扰断言
let flatKodo = new Kodo("ddb-eq-flat", { cache: false, tierLimit: 1 });
initKodoTestData(flatKodo);

describe("Partition Key 相等 (== / ===)", () => {
    test("Order.id == o3 (plain value, 完整递归)", async () => {
        let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });

        strictEqual(nodes.length, 6);
        strictEqual(!!nodes.find(m => m.$ns === "Order" && m.$id === "o3"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p3-2"), true);
        strictEqual(!!nodes.find(m => m.$ns === "OrderOwner" && m.$id === "oo3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "PaymentDetail" && m.$id === "pd3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "PaymentDetail" && m.$id === "pd3-2"), true);
    });

    test("Order.id === o3 (严格相等, 完整递归)", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: { id: { $op: "===", $val: "o3" } }
        });
        strictEqual(nodes.length, 6);
    });

    test("Order.id == o1 (只有 1 个 payment)", async () => {
        let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o1" } });

        strictEqual(nodes.length, 2);
        strictEqual(!!nodes.find(m => m.$ns === "Order" && m.$id === "o1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p1-1"), true);
    });

    test("Order.id == o4 (只有 1 个 payment)", async () => {
        let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o4" } });

        strictEqual(nodes.length, 2);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p4-1"), true);
    });

    test("Order.id == o2 (无关联节点)", async () => {
        let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o2" } });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$ns === "Order" && m.$id === "o2"), true);
    });

    test("Order.id == 不存在的值 (空结果)", async () => {
        let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o999" } });
        strictEqual(nodes.length, 0);
    });

    test("Payment.orderid === o3 (第一层)", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: { $op: "===", $val: "o3" } }
        });

        strictEqual(nodes.length, 2);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p3-2"), true);
    });
});

describe("Sort Key 范围 (>= <= > < ==)", () => {
    test(">= : orderid=o3 && id >= p3-1", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", id: { $op: ">=", $val: "p3-1" } }
        });

        strictEqual(nodes.length, 2);
        strictEqual(!!nodes.find(m => m.$id === "p3-1"), true);
        strictEqual(!!nodes.find(m => m.$id === "p3-2"), true);
    });

    test("> : orderid=o3 && id > p3-1", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", id: { $op: ">", $val: "p3-1" } }
        });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-2"), true);
    });

    test("<= : orderid=o3 && id <= p3-1", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", id: { $op: "<=", $val: "p3-1" } }
        });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-1"), true);
    });

    test("< : orderid=o3 && id < p3-2", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", id: { $op: "<", $val: "p3-2" } }
        });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-1"), true);
    });

    test("== : orderid=o3 && id == p3-2", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", id: { $op: "==", $val: "p3-2" } }
        });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-2"), true);
    });

    test("=== : orderid=o3 && id === p3-1", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", id: { $op: "===", $val: "p3-1" } }
        });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-1"), true);
    });

    test("!= : orderid=o3 && id != p3-1 (sort key 取反 → 抛异常)", async () => {
        expect(
            flatKodo.explore<Payment>({
                $ns: "Payment",
                expression: { orderid: "o3", id: { $op: "!=", $val: "p3-1" } }
            })
        ).rejects.toThrow(/sort key/);
    });

    test("边界 : id > p3-2 (空结果)", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", id: { $op: ">", $val: "p3-2" } }
        });
        strictEqual(nodes.length, 0);
    });

    test("边界 : id < p3-1 (空结果)", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", id: { $op: "<", $val: "p3-1" } }
        });
        strictEqual(nodes.length, 0);
    });
});
