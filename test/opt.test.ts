import { Kodo, MemoryProvider, NodeTranslator } from "../src";
import { initKodoTestData, printNodes, strictEqual } from "./_common";
import { Order, Payment, PaymentDetail, OrderOwner } from "./_modules";
import { describe, test } from 'bun:test';

let kodo = new Kodo("my-test-net");

initKodoTestData(kodo);

describe("Cache Test", function () {
    test("1", () => {
        kodo.setOption({ cache: false });
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "payment",
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

    test("2", () => {
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "payment",
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

    test("3", () => {
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "payment",
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

    test("4", () => {
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "order",
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

    test("5", () => {
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "order",
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

describe("Recursion Test", function () {
    test("1", () => {
        kodo.setOption({ recursion: false });
        //kodo.setOption({ recursion: false });
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "payment",
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

    test("2", () => {
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "payment",
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

    test("3", () => {
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "payment",
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

    test("4", () => {
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "order",
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

        strictEqual(nodes.length, 6);
    });
});

describe("TierLimit Test", function () {
    test("1", () => {
        kodo.setOption({ cache: false, recursion: true, tierLimit: 1 });
        let nodes = kodo.explore<Payment>({
            $id: "startup-eq-1",
            $ns: "payment",
            expression: {
                amount: {
                    $op: "===",
                    $val: 2500
                }
            }
        });

        strictEqual(nodes.length, 1);
    });

    test("2", () => {
        kodo.setOption({ cache: false, recursion: true, tierLimit: 10 });
        let nodes = kodo.explore<Payment>({
            $id: "startup-eq-1",
            $ns: "payment",
            expression: {
                amount: {
                    $op: "===",
                    $val: 2500
                }
            }
        });

        strictEqual(nodes.length, 6);
    });

    test("3", () => {
        kodo.setOption({ cache: false, recursion: true, tierLimit: 2 });
        let nodes = kodo.explore<Payment>({
            $id: "startup-eq-2",
            $ns: "payment",
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

    test("4", () => {
        kodo.setOption({ cache: false, recursion: true, tierLimit: 3 });
        let nodes = kodo.explore<Payment>({
            $id: "startup-eq-2",
            $ns: "payment",
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

    test("5", () => {
        kodo.setOption({ cache: false, recursion: true, tierLimit: 10 });
        let nodes = kodo.explore<Payment>({
            $id: "startup-eq-2",
            $ns: "payment",
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

        let o1 = nodes.find(m => m.$ns === "order" && m.$id === "o3");
        strictEqual(!!o1, true);

        let p1 = nodes.find(m => m.$ns === "payment" && m.$id === "p3-1");
        strictEqual(!!p1, true);
        let p2 = nodes.find(m => m.$ns === "payment" && m.$id === "p3-2");
        strictEqual(!!p2, true);

        let pd1 = nodes.find(m => m.$ns === "payment-detail" && m.$id === "pd3-1");
        strictEqual(!!pd1, true);
        let pd2 = nodes.find(m => m.$ns === "payment-detail" && m.$id === "pd3-2");
        strictEqual(!!pd2, true);

        let oo = nodes.find(m => m.$ns === "owner" && m.$id === "oo3-1");
        strictEqual(!!oo, true);

        //verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-2");
    });
});