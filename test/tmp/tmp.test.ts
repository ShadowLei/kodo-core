import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestExpressionData, initKodoTestData } from "./_orm_link";
import { printNodes, strictEqual, verifyIds } from "../_common";
import { describe, test } from 'bun:test';

let kodo = new Kodo("my-test-net", {
    cache: false,
    tierLimit: 10,
    recursion: false
});
initKodoTestData(kodo);

describe("TMP Test", async function () {
    
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
    test("8 - rec - false", async () => {
        let nodes = await kodo.explore<Order>({
            $id: "startup",
            $ns: "Order",
            expression: {
                $where: [
                    {
                        id: "o3"
                    },
                ]
            }
        });

        // --======= Order | o3 ===========--
        // {"id":"o3","logid":"P12345","operator":"Shadow","ts":"2026-09-12T16:13:42.615Z"}
        // id: o3
        // qnid: startup
        // lnid: null

        // --======= Payment | p3-1 ===========--
        // {"id":"p3-1","orderid":"o3","amount":1300,"operator":null,"ts":"2026-09-12T16:16:28.604Z"}
        // id: p3-1
        // qnid: qn-Order-o3-ln-Order-Payment-86812950
        // lnid: ln-Order-Payment-86812950

        // --From:--
        // id: o3
        // qnid: startup
        // lnid: null

        // --======= Payment | p3-2 ===========--
        // {"id":"p3-2","orderid":"o3","amount":2500,"operator":null,"ts":"2026-09-12T16:16:28.604Z"}
        // id: p3-2
        // qnid: qn-Order-o3-ln-Order-Payment-86812950
        // lnid: ln-Order-Payment-86812950

        // --From:--
        // id: o3
        // qnid: startup
        // lnid: null

        // --======= PaymentDetail | pd3-1 ===========--
        // {"id":"pd3-1","paymentid":"p3-1","amount":2400,"desc":"shaodw - payment on 2023","ts":"2026-09-12T16:20:57.461Z"}
        // id: pd3-1
        // qnid: qn-Payment-p3-1-ln-Payment-PaymentDetail-1603822302
        // lnid: ln-Payment-PaymentDetail-1603822302

        // --From:--
        // id: p3-1
        // qnid: qn-Order-o3-ln-Order-Payment-86812950
        // lnid: ln-Order-Payment-86812950

        // --From:--
        // id: o3
        // qnid: startup
        // lnid: null

        // --======= OrderOwner | oo3-1 ===========--
        // {"id":"oo3-1","orderid":"o3","name":"LPSV0001","ts":"2026-09-12T16:18:52.753Z"}
        // id: oo3-1
        // qnid: qn-Order-o3-ln-Order-OrderOwner-86812950
        // lnid: ln-Order-OrderOwner-86812950

        // --From:--
        // id: o3
        // qnid: startup
        // lnid: null

        // --======= PaymentDetail | pd3-2 ===========--
        // {"id":"pd3-2","paymentid":"p3-2","amount":2800,"desc":"shaodw - payment on 2024","ts":"2026-09-12T16:20:57.461Z"}
        // id: pd3-2
        // qnid: qn-Payment-p3-2-ln-Payment-PaymentDetail-1603822302
        // lnid: ln-Payment-PaymentDetail-1603822302

        // --From:--
        // id: p3-2
        // qnid: qn-Order-o3-ln-Order-Payment-86812950
        // lnid: ln-Order-Payment-86812950

        // --From:--
        // id: o3
        // qnid: startup
        // lnid: null
        // printNodes(nodes);
        strictEqual(nodes.length, 6);

    });
});