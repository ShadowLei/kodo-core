import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestExpressionData, initKodoTestData } from "./_orm_link";
import { strictEqual, verifyIds } from "../_common";
import { describe, test } from 'bun:test';

let kodo = new Kodo("my-test-net");

initKodoTestData(kodo);

describe("Cache Test", async function () {
    test("1", async () => {
        kodo.setOption({ cache: false });
        let nodes = await kodo.explore<Payment>({
            $id: "startup",
            $ns: "Payment",
            expression: {
                $where: [{
                    $where: [
                        {
                            id: {
                                $op: "==",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        //printNodes(nodes);

        strictEqual(nodes.length, 0);
    });

    test("2", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup",
            $ns: "Payment",
            expression: {
                $where: [{
                    $where: [
                        {
                            operator: {
                                $op: "!=",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        strictEqual(nodes.length, 0);
    });

    test("3", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup",
            $ns: "Payment",
            expression: {
                $where: [{
                    $where: [
                        {
                            operator: {
                                $op: "!=",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        strictEqual(nodes.length, 0);
    });

    test("4", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup",
            $ns: "Order",
            expression: {
                $where: [{
                    $with: "||",
                    $where: [
                        {
                            operator: {
                                $op: "!=",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        //printNodes(nodes);

        strictEqual(nodes.length, 8);
    });

    test("5", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup",
            $ns: "Order",
            expression: {
                $where: [{
                    $with: "||",
                    $where: [
                        {
                            operator: {
                                $op: "!=",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        strictEqual(nodes.length, 8);
    });
});

describe("Recursion Test", async function () {
    test("1", async () => {
        kodo.setOption({ recursion: false });
        //kodo.setOption({ recursion: false });
        let nodes = await kodo.explore<Payment>({
            $id: "startup",
            $ns: "Payment",
            expression: {
                $where: [{
                    $where: [
                        {
                            id: {
                                $op: "==",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        //printNodes(nodes);

        strictEqual(nodes.length, 0);
    });

    test("2", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup",
            $ns: "Payment",
            expression: {
                $where: [{
                    $where: [
                        {
                            operator: {
                                $op: "!=",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        strictEqual(nodes.length, 0);
    });

    test("3", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup",
            $ns: "Payment",
            expression: {
                $where: [{
                    $where: [
                        {
                            operator: {
                                $op: "!=",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        strictEqual(nodes.length, 0);
    });

    test("4", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup",
            $ns: "Order",
            expression: {
                $where: [{
                    $with: "||",
                    $where: [
                        {
                            operator: {
                                $op: "!=",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        strictEqual(nodes.length, 8);
    });
});

describe("TierLimit Test", async function () {
    test("1", async () => {
        kodo.setOption({ cache: false, recursion: true, tierLimit: 1 });
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-1",
            $ns: "Payment",
            expression: {
                amount: {
                    $op: "===",
                    $val: 2500
                }
            }
        });

        strictEqual(nodes.length, 1);
    });

    test("2", async () => {
        kodo.setOption({ cache: false, recursion: true, tierLimit: 10 });
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-1",
            $ns: "Payment",
            expression: {
                amount: {
                    $op: "===",
                    $val: 2500
                }
            }
        });

        strictEqual(nodes.length, 6);
    });

    test("3", async () => {
        kodo.setOption({ cache: false, recursion: true, tierLimit: 2 });
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-2",
            $ns: "Payment",
            expression: {
                orderid: "o3",
                id: {
                    $op: "===",
                    $val: "p3-2"
                }
            }
        });

        strictEqual(nodes.length, 3);
    });

    test("4", async () => {
        kodo.setOption({ cache: false, recursion: true, tierLimit: 3 });
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-2",
            $ns: "Payment",
            expression: {
                orderid: "o3",
                id: {
                    $op: "===",
                    $val: "p3-2"
                }
            }
        });

        //printNodes(nodes);

        strictEqual(nodes.length, 5);
    });

    test("5", async () => {
        kodo.setOption({ cache: false, recursion: true, tierLimit: 10 });
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-2",
            $ns: "Payment",
            expression: {
                orderid: "o3",
                id: {
                    $op: "===",
                    $val: "p3-2"
                }
            }
        });

        //p3-2 | o3 | p3-1 | pd3-1 | oo3-1 | pd3-2
        //printNodes(nodes);

        strictEqual(nodes.length, 6);

        let o1 = nodes.find(m => m.$ns === "Order" && m.$id === "o3");
        strictEqual(!!o1, true);

        let p1 = nodes.find(m => m.$ns === "Payment" && m.$id === "p3-1");
        strictEqual(!!p1, true);
        let p2 = nodes.find(m => m.$ns === "Payment" && m.$id === "p3-2");
        strictEqual(!!p2, true);

        let pd1 = nodes.find(m => m.$ns === "PaymentDetail" && m.$id === "pd3-1");
        strictEqual(!!pd1, true);
        let pd2 = nodes.find(m => m.$ns === "PaymentDetail" && m.$id === "pd3-2");
        strictEqual(!!pd2, true);

        let oo = nodes.find(m => m.$ns === "OrderOwner" && m.$id === "oo3-1");
        strictEqual(!!oo, true);

        //verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-2");
    });
});

describe("recursion=false 沿 fromDN 链去重 (重复 namespace 即停止)", () => {
    test("从 Order 出发，PaymentDetail 按路径各查询一次 (pd3-2 存在)", async () => {
        let k = new Kodo("r-o", { cache: false, recursion: false, tierLimit: 10 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });

        strictEqual(nodes.length, 6);
        strictEqual(!!nodes.find(m => m.$ns === "Order" && m.$id === "o3"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "Payment" && m.$id === "p3-2"), true);
        strictEqual(!!nodes.find(m => m.$ns === "OrderOwner" && m.$id === "oo3-1"), true);
        strictEqual(!!nodes.find(m => m.$ns === "PaymentDetail" && m.$id === "pd3-1"), true);
        // pd3-2 通过 p3-2 的另一条路径被查询
        strictEqual(!!nodes.find(m => m.$ns === "PaymentDetail" && m.$id === "pd3-2"), true);
    });

    test("从 Payment 出发，同样 6 节点", async () => {
        let k = new Kodo("r-p", { cache: false, recursion: false, tierLimit: 10 });
        initKodoTestData(k);
        let nodes = await k.explore<Payment>({ $ns: "Payment", expression: { orderid: "o3" } });
        strictEqual(nodes.length, 6);
    });
});

describe("tierLimit 边界 (recursion=true, 从 Order 出发)", () => {
    test("tierLimit=1 只加载起始层", async () => {
        let k = new Kodo("t1", { cache: false, recursion: true, tierLimit: 1 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 1);
    });

    test("tierLimit=2 加载到 payment/owner 层", async () => {
        let k = new Kodo("t2", { cache: false, recursion: true, tierLimit: 2 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 4);
    });

    test("tierLimit=3 加载完整关联 (等于图深度)", async () => {
        let k = new Kodo("t3", { cache: false, recursion: true, tierLimit: 3 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 6);
    });

    test("tierLimit=4 超过图深度 (反向去重，仍 6 节点)", async () => {
        let k = new Kodo("t4", { cache: false, recursion: true, tierLimit: 4 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 6);
    });

    test("tierLimit=0 默认不限制 (仍 6 节点)", async () => {
        let k = new Kodo("t0", { cache: false, recursion: true, tierLimit: 0 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 6);
    });
});

describe("recursion=false + tierLimit 组合", () => {
    test("tierLimit=1", async () => {
        let k = new Kodo("rt1", { cache: false, recursion: false, tierLimit: 1 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 1);
    });

    test("tierLimit=2", async () => {
        let k = new Kodo("rt2", { cache: false, recursion: false, tierLimit: 2 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 4);
    });

    test("tierLimit=3", async () => {
        let k = new Kodo("rt3", { cache: false, recursion: false, tierLimit: 3 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 6);
    });

    test("tierLimit=10 (足够大，仍 6 节点)", async () => {
        let k = new Kodo("rt10", { cache: false, recursion: false, tierLimit: 10 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        strictEqual(nodes.length, 6);
    });
});

describe("limit 强制限制查询数量", () => {
    test("默认 limit=10，数据量 < 10 时返回全部", async () => {
        let k = new Kodo("l-default", { cache: false, tierLimit: 1 });
        initKodoTestData(k);
        let nodes = await k.explore<Payment>({ $ns: "Payment", expression: { orderid: "xxx" } });
        strictEqual(nodes.length, 2);
    });

    test("limit=1 限制返回 1 条", async () => {
        let k = new Kodo("l-1", { cache: false, tierLimit: 1, limit: 1 });
        initKodoTestData(k);
        let nodes = await k.explore<Payment>({ $ns: "Payment", expression: { orderid: "xxx" } });
        strictEqual(nodes.length, 1);
    });

    test("limit=100 大于数据量时返回全部", async () => {
        let k = new Kodo("l-100", { cache: false, tierLimit: 1, limit: 100 });
        initKodoTestData(k);
        let nodes = await k.explore<Payment>({ $ns: "Payment", expression: { orderid: "xxx" } });
        strictEqual(nodes.length, 2);
    });

    test("limit=2 限制 IN 查询返回 2 条", async () => {
        let k = new Kodo("l-in", { cache: false, tierLimit: 1, limit: 2 });
        initKodoTestData(k);
        let nodes = await k.explore<Order>({ $ns: "Order", expression: { id: { $op: "IN", $val: ["o1", "o2", "o3", "o4"] } } });
        strictEqual(nodes.length, 2);
    });
});