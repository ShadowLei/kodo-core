import { DataNode, Kodo, NotificationRule } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestExpressionData, initKodoTestData } from "./_orm_link";
import { printNodes, strictEqual, verifyIds } from "../_common";
import { describe, test } from 'bun:test';

// function rule(overrides: Partial<NotificationRule> = {}): NotificationRule {
//     return { id: "r", $ns: "Payment", match: {}, ...overrides };
// }

// function ids(violated: DataNode<any>[]): (string | number)[] {
//     return violated.map(n => n.$id);
// }

let kodo = new Kodo("my-test-net", {
    cache: false,
    tierLimit: 10,
    recursion: false
});
initKodoTestData(kodo);

describe("TMP Test", async function () {

    test("any Payment amount [100, 200] - none", async () => {
        let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        let violations = await kodo.checkRules([
            {
                id: "r",
                $ns: "Payment",
                expect: "any",
                match: {
                    $with: "&&",
                    $where: [
                    {
                        amount: { $op: ">=", $val: 100 }
                    },
                    {
                        amount: { $op: "<=", $val: 200 }
                    }
                ]}
            }
        ], nodes);

        // console.log(nodes);

        strictEqual(violations.length, 1);
        strictEqual(violations[0].violated.length, 2);
    });

    test("any amount - [100, 200] - none", async () => {
        let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
        let violations = await kodo.checkRules([
            {
                id: "r",
                // $ns: "Payment",
                expect: "any",
                match: {
                    $with: "&&",
                    $where: [
                    {
                        amount: { $op: ">=", $val: 100 }
                    },
                    {
                        amount: { $op: "<=", $val: 200 }
                    }
                ]}
            }
        ], nodes);

        strictEqual(violations.length, 1);
        strictEqual(violations[0].violated.length, 6);
    });
    
    // test("0 - amount", async () => {
    //     let nodes = await kodo.explore<Payment>({
    //         $id: "startup",
    //         $ns: "Payment",
    //         expression: {
    //             $where: [
    //                 {
    //                     amount: {
    //                         $op: ">=",
    //                         $val: 2500
    //                     }
    //                 },
    //             ]
    //         }
    //     });

    //     // printNodes(nodes);
    //     strictEqual(nodes.length, 4);
    
    // });

    //
    // query: SELECT version()
    // query: SELECT * FROM current_schema()
    //
    // [ok - o3 * 1] query: SELECT "Order"."id" AS "Order_id", "Order"."logid" AS "Order_logid", "Order"."operator" AS "Order_operator", "Order"."ts" AS "Order_ts" FROM "order" "Order" WHERE (id = $1) LIMIT 10 -- PARAMETERS: ["o3"]
    // [ok - o3 * 2] query: SELECT "Payment"."id" AS "Payment_id", "Payment"."orderid" AS "Payment_orderid", "Payment"."amount" AS "Payment_amount", "Payment"."operator" AS "Payment_operator", "Payment"."ts" AS "Payment_ts" FROM "payment" "Payment" WHERE orderid = $1 LIMIT 10 -- PARAMETERS: ["o3"]
    // [ok - p3-1 * 1] query: SELECT "PaymentDetail"."id" AS "PaymentDetail_id", "PaymentDetail"."paymentid" AS "PaymentDetail_paymentid", "PaymentDetail"."amount" AS "PaymentDetail_amount", "PaymentDetail"."desc" AS "PaymentDetail_desc", "PaymentDetail"."ts" AS "PaymentDetail_ts" FROM "payment-detail" "PaymentDetail" WHERE paymentid = $1 LIMIT 10 -- PARAMETERS: ["p3-1"]
    // [ok - o3 * 1 ] query: SELECT "OrderOwner"."id" AS "OrderOwner_id", "OrderOwner"."orderid" AS "OrderOwner_orderid", "OrderOwner"."name" AS "OrderOwner_name", "OrderOwner"."ts" AS "OrderOwner_ts" FROM "owner" "OrderOwner" WHERE orderid = $1 LIMIT 10 -- PARAMETERS: ["o3"]
    // [ok - p3-2 * 1] query: SELECT "PaymentDetail"."id" AS "PaymentDetail_id", "PaymentDetail"."paymentid" AS "PaymentDetail_paymentid", "PaymentDetail"."amount" AS "PaymentDetail_amount", "PaymentDetail"."desc" AS "PaymentDetail_desc", "PaymentDetail"."ts" AS "PaymentDetail_ts" FROM "payment-detail" "PaymentDetail" WHERE paymentid = $1 LIMIT 10 -- PARAMETERS: ["p3-2"]
    // ✓ TMP Test > 8 - rec - false [47.48ms]
    // test("1 - rec - false", async () => {
    //     let nodes = await kodo.explore<Order>({
    //         $id: "startup",
    //         $ns: "Order",
    //         expression: {
    //             $where: [
    //                 {
    //                     id: "o3"
    //                 },
    //             ]
    //         }
    //     });

    //     // printNodes(nodes);
    //     strictEqual(nodes.length, 6);
    // });
});
