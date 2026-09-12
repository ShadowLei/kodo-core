import { Kodo } from "../../src";
import { initKodoTestData, initKodoTestExpressionData } from "./_meta_link";
import { strictEqual, verifyIds } from "../_common";
import { Order, Payment, PaymentDetail, OrderOwner } from "../_module";
import { describe, test } from 'bun:test';

let kodo = new Kodo("my-test-net", {
    cache: false
});
initKodoTestExpressionData(kodo);

// *** Add: payment-p3-2   payment | p3-2
// 1
// *** Add: order-o3   order | o3
// 1
// *** Add: payment-detail-pd3-2   payment-detail | pd3-2
// 2
// *** Add: payment-p3-1   payment | p3-1
// 1
// *** Add: owner-oo3-1    owner | oo3-1
// *** Add: payment-detail-pd3-1   

// async function tester() {
//     let nodes = await kodo.explore<Payment>({
//         $id: "startup-eq-1",
//         $ns: "payment",
//         expression: p => p.amount === 2500
//     });

//     console.log("--==========================================--");
//     printNodes(nodes);
//     console.log("--==========================================--");
// }

// await tester();

describe("EQ Expression Test", async function () {

    describe("Simple ===", async function () {
        test("1", async () => {
            let nodes = await kodo.explore<Payment>({
                $id: "startup-eq-1",
                $ns: "payment",
                expression: p => p.amount === 2500
            });

            // console.log("--==========================================--");
            // printNodes(nodes);
            // console.log("--==========================================--");


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

            verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-1");
        });

        test("2", async () => {
            let nodes = await kodo.explore<Payment>({
                $id: "startup-eq-2",
                $ns: "payment",
                expression: p => p.orderid === "o3" && p.id === "p3-2"
            });

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

            verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-2");
        });

        test("3", async () => {
            let nodes = await kodo.explore<Payment>({
                $id: "startup-eq-3",
                $ns: "payment",
                expression: p => p.id === "p3-1" || p.orderid === "o3"
            });

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

            //verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-3");
        });

        test("4", async () => {
            let nodes = await kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.orderid === "o3" && p.id === "p3-3"
            });

            strictEqual(nodes.length, 0);
        });

        test("5", async () => {
            let nodes = await kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.operator == null
            });

            strictEqual(nodes.length, 12);
        });

        test("6", async () => {
            let nodes = await kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.operator == undefined
            });

            strictEqual(nodes.length, 12);
        });
    });

    describe("Compare ==", async function () {
        test("1", async () => {
            let nodes = await kodo.explore<Payment>({
                $id: "startup-eq-1",
                $ns: "payment",
                expression: p => p.amount == 2500
            });

            strictEqual(nodes.length, 6);
        });

        test("2", async () => {
            let nodes = await kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.operator === null
            });

            strictEqual(nodes.length, 0);
        });

        test("3", async () => {
            let nodes = await kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.operator === undefined
            });

            strictEqual(nodes.length, 12);
        });

        test("4", async () => {
            let nodes = await kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.operator === undefined && p.operator === null
            });

            strictEqual(nodes.length, 0);
        });

        test("5 - all", async () => {
            let nodes = await kodo.explore<Order>({
                $id: "startup",
                $ns: "order",
                expression: p => ["o1", "o2", "o3", "o4"].findIndex(m => m === p.id) >= 0
            });

            strictEqual(nodes.length, 11);
        });
    });
});