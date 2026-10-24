import { describe, test, expect } from 'bun:test';
import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestData } from "./_ddb_link";
import { strictEqual } from "../_common";

describe("tierLimit 递归深度 (recursion=true, 从 Order 出发)", () => {
    test("tierLimit=1 只加载起始层", async () => {
        let k = new Kodo("t-o-1", { cache: false, recursion: true, tierLimit: 1 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 1);
    });

    test("tierLimit=2 加载到 payment/owner 层", async () => {
        let k = new Kodo("t-o-2", { cache: false, recursion: true, tierLimit: 2 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 4);
    });

    test("tierLimit=3 加载完整关联 (等于图深度)", async () => {
        let k = new Kodo("t-o-3", { cache: false, recursion: true, tierLimit: 3 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 6);
    });

    test("tierLimit=4 超过图深度 → 反向链接触发 scan 异常", async () => {
        let k = new Kodo("t-o-4", { cache: false, recursion: true, tierLimit: 4 });
        initKodoTestData(k);
        expect(
            k.explore<Order>({ $ns: "Order", expression: { id: "o3" } })
        ).rejects.toThrow(/requires the partition key/);
    });

    test("tierLimit=0 (默认不限制) → 反向链接触发 scan 异常", async () => {
        let k = new Kodo("t-o-0", { cache: false, recursion: true, tierLimit: 0 });
        initKodoTestData(k);
        expect(
            k.explore<Order>({ $ns: "Order", expression: { id: "o3" } })
        ).rejects.toThrow(/requires the partition key/);
    });
});

describe("tierLimit 递归深度 (recursion=true, 从 Payment 出发)", () => {
    test("tierLimit=1 只加载起始层", async () => {
        let k = new Kodo("t-p-1", { cache: false, recursion: true, tierLimit: 1 });
        initKodoTestData(k);
        let nodes = await k.explore<Payment>({ $ns: "Payment", expression: { orderid: "o3" } });
        strictEqual(nodes.length, 2);
    });

    test("tierLimit=2 加载到 order/detail 层", async () => {
        let k = new Kodo("t-p-2", { cache: false, recursion: true, tierLimit: 2 });
        initKodoTestData(k);
        let nodes = await k.explore<Payment>({ $ns: "Payment", expression: { orderid: "o3" } });
        strictEqual(nodes.length, 5);
    });

    test("tierLimit=3 → 反向链接触发 scan 异常", async () => {
        let k = new Kodo("t-p-3", { cache: false, recursion: true, tierLimit: 3 });
        initKodoTestData(k);
        expect(
            k.explore<Payment>({ $ns: "Payment", expression: { orderid: "o3" } })
        ).rejects.toThrow(/requires the partition key/);
    });
});

describe("recursion=false 单向查询 (namespace 只查询一次)", () => {
    test("从 Order 出发，PaymentDetail 只查询一次 (pd3-2 缺失)", async () => {
        let k = new Kodo("r-o", { cache: false, recursion: false, tierLimit: 10 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });

        strictEqual(nodes.length, 5);
        strictEqual(!!nodes.find(m => m.$ns === "Order" && m.$id === "o3"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p3-2"), true);
        strictEqual(!!nodes.find(m => m.$ns === "OrderOwner" && m.$id === "oo3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "PaymentDetail" && m.$id === "pd3-1"), true);
        // pd3-2 因 PaymentDetail 已查询过被跳过
        strictEqual(!!nodes.find(m => m.$ns === "PaymentDetail" && m.$id === "pd3-2"), false);
    });

    test("从 Payment 出发，同样 5 节点 (pd3-2 缺失)", async () => {
        let k = new Kodo("r-p", { cache: false, recursion: false, tierLimit: 10 });
        initKodoTestData(k);
        let nodes = await k.explore<Payment>({ $ns: "Payment", expression: { orderid: "o3" } });
        strictEqual(nodes.length, 5);
    });

    test("recursion=false 避免反向链接异常 (tierLimit 足够大也不触发 scan)", async () => {
        let k = new Kodo("r-safe", { cache: false, recursion: false, tierLimit: 10 });
        initKodoTestData(k);
        // 反向链接 PaymentDetail->Payment 被 existNS 挡住，不抛异常
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 5);
    });
});

describe("recursion=false + tierLimit 组合", () => {
    test("tierLimit=1", async () => {
        let k = new Kodo("rt-1", { cache: false, recursion: false, tierLimit: 1 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 1);
    });

    test("tierLimit=2", async () => {
        let k = new Kodo("rt-2", { cache: false, recursion: false, tierLimit: 2 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 4);
    });

    test("tierLimit=3", async () => {
        let k = new Kodo("rt-3", { cache: false, recursion: false, tierLimit: 3 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 5);
    });

    test("tierLimit=10 (足够大，仍只 5 节点)", async () => {
        let k = new Kodo("rt-10", { cache: false, recursion: false, tierLimit: 10 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 5);
    });
});

describe("cache 选项", () => {
    test("cache=true 跨 explore 累积节点", async () => {
        let k = new Kodo("cache-true", { cache: true, tierLimit: 3 });
        initKodoTestData(k);

        let n1 = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(n1.length, 6);

        let n2 = await k.explore<Order>({ $ns: "Order", expression: { id: "o1" } });
        strictEqual(n2.length, 8);

        let n3 = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(n3.length, 8);
    });

    test("cache=false 每次 explore 清空", async () => {
        let k = new Kodo("cache-false", { cache: false, tierLimit: 3 });
        initKodoTestData(k);

        let n1 = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(n1.length, 6);

        let n2 = await k.explore<Order>({ $ns: "Order", expression: { id: "o1" } });
        strictEqual(n2.length, 2);
    });
});
