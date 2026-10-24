import { describe, test } from 'bun:test';
import { Kodo } from "../../src";
import { Order } from "../_module";
import { initKodoTestData } from "./_ddb_link";
import { strictEqual } from "../_common";

describe("tierLimit 递归深度", () => {
    test("tierLimit=1 只加载起始层", async () => {
        let k = new Kodo("t1", { cache: false, tierLimit: 1 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 1);
    });

    test("tierLimit=2 加载到 payment/owner 层", async () => {
        let k = new Kodo("t2", { cache: false, tierLimit: 2 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 4);
    });

    test("tierLimit=3 加载完整关联", async () => {
        let k = new Kodo("t3", { cache: false, tierLimit: 3 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 6);
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

describe("recursion 选项", () => {
    test("recursion=false 通过 existNS 剪枝避免反向链接", async () => {
        let k = new Kodo("rec-false", { cache: false, recursion: false, tierLimit: 10 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        // recursion=false 按 namespace 去重，PaymentDetail 只查询一次（pd3-2 被跳过）
        strictEqual(nodes.length, 5);
    });
});
