import { Kodo } from "../../src";
import { initKodoTestData, initKodoTestExpressionData } from "./_meta_link";
import { strictEqual, verifyIds } from "../_common";
import { Order, Payment, PaymentDetail, OrderOwner } from "../_module";
import { describe, test } from 'bun:test';

let kodo = new Kodo("my-test-net", {
    cache: false
});
initKodoTestData(kodo);

describe("Null Test", async function () {
    test("1", async () => {
        let nodes = await kodo.explore<Payment>({
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

        strictEqual(nodes.length, 0);
    });

    test("2", async () => {
        let nodes = await kodo.explore<Payment>({
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

    test("3", async () => {
        let nodes = await kodo.explore<Payment>({
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

    test("4", async () => {
        let nodes = await kodo.explore<Order>({
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
