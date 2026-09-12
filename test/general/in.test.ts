import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestExpressionData, initKodoTestData } from "./_general_link";
import { strictEqual, verifyIds } from "../_common";
import { describe, test } from 'bun:test';

let kodo = new Kodo("my-test-net", {
    cache: false
});
initKodoTestData(kodo);

describe("IN", async function () {
    test("1", async () => {
        let nodes = await kodo.explore<Payment>({
            $ns: "Payment",
            expression: {
                id: {
                    $op: "IN",
                    $val: ["p1a-1", "233"],
                }
            }
        });

        strictEqual(nodes.length, 0);

    });

    test("2", async () => {
        let nodes = await kodo.explore<Payment>({
            $ns: "Payment",
            expression: {
                id: {
                    $op: "IN",
                    $val: ["p1-1", "233"],
                }
            }
        });

        strictEqual(nodes.length, 2);

        let o = nodes.find(m => m.$id === "o1" && m.$ns === "Order");
        strictEqual(!!o, true);

        let p = nodes.find(m => m.$id === "p1-1" && m.$ns === "Payment");
        strictEqual(!!p, true);
    });

    test("3", async () => {
        let nodes = await kodo.explore<Payment>({
            $ns: "Payment",
            expression: {
                id: {
                    $op: "IN",
                    $val: ["p1-1", "p3-1"],
                }
            }
        });

        strictEqual(nodes.length, 8);
    });

    test("4", async () => {
        let nodes = await kodo.explore<Payment>({
            $ns: "Payment",
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

    test("4", async () => {
        let nodes = await kodo.explore<Payment>({
            $ns: "Payment",
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