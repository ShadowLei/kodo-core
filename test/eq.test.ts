import { Kodo, MemoryProvider, NodeTranslator } from "../src";
import { Order, Payment, PaymentDetail, OrderOwner } from "./_module";
import { initKodoTestData } from "./_general_link";
import { strictEqual, verifyIds } from "./_common";
import { describe, test } from 'bun:test';

let kodo = new Kodo("my-test-net", {
    cache: false
});
initKodoTestData(kodo);

describe("Simple ===", async function () {
    test("1", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-1",
            $ns: "Payment",
            expression: {
                amount: {
                    $op: "===",
                    $val: 2500
                },
            }
        });

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

        verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-1");
    });

    test("2", async () => {
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

        verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-2");
    });

    test("3", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-3",
            $ns: "Payment",
            expression: {
                $with: "||",
                orderid: "o3",
                id: {
                    $op: "===",
                    $val: "p3-1"
                }
            }
        });

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

        //verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-3");
    });

    test("4", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-4",
            $ns: "Payment",
            expression: {
                $with: "&&",
                orderid: "o3",
                id: {
                    $op: "===",
                    $val: "p3-3"
                }
            }
        });

        strictEqual(nodes.length, 0);
    });

    test("5", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-4",
            $ns: "Payment",
            expression: {
                $where: [{
                    $with: "||",
                    $where: [
                        {
                            operator: {
                                $op: "==",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        strictEqual(nodes.length, 12);
    });

    test("6", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-4",
            $ns: "Payment",
            expression: {
                $where: [{
                    $with: "||",
                    $where: [
                        {
                            operator: {
                                $op: "==",
                                $val: undefined
                            }
                        }
                    ]
                }]
            }
        });

        strictEqual(nodes.length, 12);
    });
});

describe("Compare ==", async function () {
    test("1", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-1",
            $ns: "Payment",
            expression: {
                amount: {
                    $op: "==",
                    $val: ("2500" as any)
                }
            }
        });

        strictEqual(nodes.length, 6);
    });

    test("2", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-4",
            $ns: "Payment",
            expression: {
                $where: [{
                    $with: "||",
                    $where: [
                        {
                            operator: {
                                $op: "===",
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
            $id: "startup-eq-4",
            $ns: "Payment",
            expression: {
                $where: [{
                    $with: "||",
                    $where: [
                        {
                            operator: {
                                $op: "===",
                                $val: undefined
                            }
                        }
                    ]
                }]
            }
        });

        strictEqual(nodes.length, 12);
    });

    test("4", async () => {
        let nodes = await kodo.explore<Payment>({
            $id: "startup-eq-4",
            $ns: "Payment",
            expression: {
                $where: [{
                    $where: [
                        {
                            operator: {
                                $op: "===",
                                $val: undefined
                            }
                        },
                        {
                            operator: {
                                $op: "===",
                                $val: null
                            }
                        }
                    ]
                }]
            }
        });

        strictEqual(nodes.length, 0);
    });

    test("5 - all", async () => {
        let nodes = await kodo.explore<Order>({
            $id: "startup",
            $ns: "Order",
            expression: {
                $where: [
                    {
                        id: {
                            $op: "IN",
                            $val: ["o1", "o2", "o3", "o4"]
                        }
                    },
                ]
            }
        });

        strictEqual(nodes.length, 11);
    });

    test("6 - partial", async () => {
        let nodes = await kodo.explore<Order>({
            $id: "startup",
            $ns: "Order",
            expression: {
                $where: [
                    {
                        id: {
                            $op: "IN",
                            $val: ["o2", "o3"]
                        }
                    },
                ]
            }
        });

        strictEqual(nodes.length, 7);
    });

    test("7 - partial", async () => {
        let nodes = await kodo.explore<Order>({
            $id: "startup",
            $ns: "Order",
            expression: {
                $where: [
                    {
                        id: {
                            $op: "IN",
                            $val: ["o1", "o4"]
                        }
                    },
                ]
            }
        });

        strictEqual(nodes.length, 4);
    });
});