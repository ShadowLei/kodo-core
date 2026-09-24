import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestData } from "./_orm_link";
import { strictEqual, verifyIds } from "../_common";
import { describe, test } from 'bun:test';

let kodo = new Kodo("my-test-net", {
    cache: false,
    tierLimit: 1
});
initKodoTestData(kodo);

describe("Complex", async function () {
    test("1", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: {
                id: {
                    $op: "IN",
                    $val: ["o1", "o2", "o3"],
                },
                ts: {
                    $op: "<=",
                    $val: new Date()
                },
                $where: [
                    {
                        $with: "||",
                        id: "o3",
                        ts: {
                            $op: ">=",
                            $val: new Date()
                        },
                        $where: [
                            {
                                id: "o3",
                                operator: "Shadow",
                            }
                        ]
                    }
                ]
            }
        });

        strictEqual(nodes.length, 1);

    });

    test("1", async () => {
        let nodes = await kodo.explore<Order>({
            $ns: "Order",
            expression: {
                id: {
                    $op: "IN",
                    $val: ["o1", "o2", "o4"],
                },
                ts: {
                    $op: "<=",
                    $val: new Date()
                },
                $where: [
                    {
                        $with: "&&",
                        id: "o3",
                        ts: {
                            $op: ">=",
                            $val: new Date()
                        },
                        $where: [
                            {
                                id: "o4",
                                operator: "Allen",
                            }
                        ]
                    }
                ]
            }
        });

        strictEqual(nodes.length, 0);

    });
});