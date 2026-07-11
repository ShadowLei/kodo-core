


import { DataNode, Kodo, MemoryProvider, NodeTranslator } from "../src";
import { Order, Payment, PaymentDetail, OrderOwner } from "./_modules";
import { initKodoTestData, printNodes, strictEqual, verifyIds } from "./_common";
import { describe, test } from 'bun:test';

let kodo = new Kodo("my-test-net", {
    cache: false
});
initKodoTestData(kodo);

describe("IN", function () {
    test("1", () => {
        let nodes = kodo.explore<Payment>({
            $ns: "payment",
            expression: {
                id: {
                    $op: "IN",
                    $val: ["p1a-1", "233"],
                }
            }
        });

        strictEqual(nodes.length, 0);

    });

    test("2", () => {
        let nodes = kodo.explore<Payment>({
            $ns: "payment",
            expression: {
                id: {
                    $op: "IN",
                    $val: ["p1-1", "233"],
                }
            }
        });

        strictEqual(nodes.length, 2);

        let o = nodes.find(m => m.$id === "o1" && m.$ns === "order");
        strictEqual(!!o, true);

        let p = nodes.find(m => m.$id === "p1-1" && m.$ns === "payment");
        strictEqual(!!p, true);
    });

    test("3", () => {
        let nodes = kodo.explore<Payment>({
            $ns: "payment",
            expression: {
                id: {
                    $op: "IN",
                    $val: ["p1-1", "p3-1"],
                }
            }
        });

        strictEqual(nodes.length, 8);
    });

    test("4", () => {
        let nodes = kodo.explore<Payment>({
            $ns: "payment",
            expression: {
                id: {
                    $op: "!IN",
                    $val: ["p1-1", "p3-1"],
                }
            }
        });

        //TODO here:
        //NOTE:
        //the p3-1 will be loaded again, since p3-2 => o3 => p3-1
        //Consider a validation "Combination" later?
        //Looks a logic trip, don't know how to consider for a valid case yet.

        strictEqual(nodes.length, 10);
    });

    test("4", () => {
        let nodes = kodo.explore<Payment>({
            $ns: "payment",
            expression: {
                id: {
                    $op: "!IN",
                    $val: ["p1-1", "p3-1", "p3-2"],
                }
            }
        });

        //printNodes(nodes);

        strictEqual(nodes.length, 4);
    });
});