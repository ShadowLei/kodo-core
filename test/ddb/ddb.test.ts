import { describe, test, expect } from 'bun:test';
import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestData } from "./_ddb_link";
import { printNodes, strictEqual } from "../_common";

// 完整递归：加载所有关联节点（tierLimit=3 从 Order 出发可拿到全量节点，
// 且不会触发 PaymentDetail -> Payment 的反向链接——那在 DDB 下是缺 pk 的 scan）
let kodo = new Kodo("my-test-net", { cache: false, tierLimit: 3 });
initKodoTestData(kodo);

// 仅第一层：用于 sort key / filter 等基础查询，避免递归干扰断言
let flatKodo = new Kodo("my-test-net-flat", { cache: false, tierLimit: 1 });
initKodoTestData(flatKodo);

describe("Partition Key 相等 (== / ===)", () => {
    test("Order.id == o3 完整递归", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3" }
        });

        printNodes(nodes);

        strictEqual(nodes.length, 6);
        strictEqual(!!nodes.find(m => m.$ns === "Order" && m.$id === "o3"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p3-2"), true);
        strictEqual(!!nodes.find(m => m.$ns === "OrderOwner" && m.$id === "oo3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "PaymentDetail" && m.$id === "pd3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "PaymentDetail" && m.$id === "pd3-2"), true);
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

    test("Order.id == o1 (无 detail/owner 分支)", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o1" }
        });

        strictEqual(nodes.length, 2);
        strictEqual(!!nodes.find(m => m.$ns === "Order" && m.$id === "o1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p1-1"), true);
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
});


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

    test("Order.id IN [o1, o2, o3, o4]", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: { id: { $op: "IN", $val: ["o1", "o2", "o3", "o4"] } }
        });

        strictEqual(nodes.length, 11);
    });
});

describe("Filter (非 key 字段过滤)", () => {
    test("amount >= 1300", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: ">=", $val: 1300 } }
        });

        strictEqual(nodes.length, 2);
    });

    test("amount < 2000", async () => {
        let nodes = await flatKodo.explore<Payment>({
            $ns: "Payment",
            expression: { orderid: "o3", amount: { $op: "<", $val: 2000 } }
        });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "p3-1"), true);
    });

    test("operator != null", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", operator: { $op: "!=", $val: null } }
        });

        strictEqual(nodes.length, 1);
    });
});

describe("Scan 保护 (缺少 partition key 抛异常)", () => {
    test("Payment.amount == 1300", async () => {
        expect(
            flatKodo.explore<Payment>({ $ns: "Payment", expression: { amount: 1300 } })
        ).rejects.toThrow(/partition key/);
    });

    test("Order.logid == shadow", async () => {
        expect(
            flatKodo.explore<Order>({ $ns: "Order", expression: { logid: "shadow" } })
        ).rejects.toThrow(/partition key/);
    });
});

describe("场景 - tierLimit 递归深度", () => {
    test("tierLimit=1 只加载起始层", async () => {
        let k = new Kodo("t1", { cache: false, tierLimit: 1 });
        initKodoTestData(k);

        let nodes = await k.explore<Order>({
            $ns: "Order",
            expression: { id: "o3" }
        });

        strictEqual(nodes.length, 1);
    });

    test("tierLimit=2 加载到 payment/owner 层", async () => {
        let k = new Kodo("t2", { cache: false, tierLimit: 2 });
        initKodoTestData(k);

        let nodes = await k.explore<Order>({
            $ns: "Order",
            expression: { id: "o3" }
        });

        // o3 + p3-1 + p3-2 + oo3-1
        strictEqual(nodes.length, 4);
    });

    test("tierLimit=3 加载完整关联", async () => {
        let k = new Kodo("t3", { cache: false, tierLimit: 3 });
        initKodoTestData(k);

        let nodes = await k.explore<Order>({
            $ns: "Order",
            expression: { id: "o3" }
        });

        strictEqual(nodes.length, 6);
    });
});

