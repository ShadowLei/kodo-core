import { Kodo, MemoryProvider, NodeTranslator } from "../src";
import { Order, Payment, PaymentDetail, OrderOwner } from "./_modules";
import { initKodoTestExpressionData, verifyIds } from "./_common";
import * as assert from "assert";

let kodo = new Kodo("my-test-net", {
    cache: false
});

describe("EQ Expression Test", function () {

    before(function () {
        initKodoTestExpressionData(kodo);
    });

    describe("Simple ===", function () {
        it("1", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-1",
                $ns: "payment",
                expression: p => p.amount === 2500
            });

            assert.strictEqual(nodes.length, 6);

            let o1 = nodes.find(m => m.$ns === "order" && m.$id === "o3");
            assert.strictEqual(!!o1, true);

            let p1 = nodes.find(m => m.$ns === "payment" && m.$id === "p3-1");
            assert.strictEqual(!!p1, true);
            let p2 = nodes.find(m => m.$ns === "payment" && m.$id === "p3-2");
            assert.strictEqual(!!p2, true);

            let pd1 = nodes.find(m => m.$ns === "payment-detail" && m.$id === "pd3-1");
            assert.strictEqual(!!pd1, true);
            let pd2 = nodes.find(m => m.$ns === "payment-detail" && m.$id === "pd3-2");
            assert.strictEqual(!!pd2, true);

            let oo = nodes.find(m => m.$ns === "owner" && m.$id === "oo3-1");
            assert.strictEqual(!!oo, true);

            verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-1");
        });

        it("2", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-2",
                $ns: "payment",
                expression: p => p.orderid === "o3" && p.id === "p3-2"
            });

            assert.strictEqual(nodes.length, 6);

            let o1 = nodes.find(m => m.$ns === "order" && m.$id === "o3");
            assert.strictEqual(!!o1, true);

            let p1 = nodes.find(m => m.$ns === "payment" && m.$id === "p3-1");
            assert.strictEqual(!!p1, true);
            let p2 = nodes.find(m => m.$ns === "payment" && m.$id === "p3-2");
            assert.strictEqual(!!p2, true);

            let pd1 = nodes.find(m => m.$ns === "payment-detail" && m.$id === "pd3-1");
            assert.strictEqual(!!pd1, true);
            let pd2 = nodes.find(m => m.$ns === "payment-detail" && m.$id === "pd3-2");
            assert.strictEqual(!!pd2, true);

            let oo = nodes.find(m => m.$ns === "owner" && m.$id === "oo3-1");
            assert.strictEqual(!!oo, true);

            verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-2");
        });

        it("3", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-3",
                $ns: "payment",
                expression: p => p.id === "p3-1" || p.orderid === "o3"
            });

            assert.strictEqual(nodes.length, 6);

            let o1 = nodes.find(m => m.$ns === "order" && m.$id === "o3");
            assert.strictEqual(!!o1, true);

            let p1 = nodes.find(m => m.$ns === "payment" && m.$id === "p3-1");
            assert.strictEqual(!!p1, true);
            let p2 = nodes.find(m => m.$ns === "payment" && m.$id === "p3-2");
            assert.strictEqual(!!p2, true);

            let pd1 = nodes.find(m => m.$ns === "payment-detail" && m.$id === "pd3-1");
            assert.strictEqual(!!pd1, true);
            let pd2 = nodes.find(m => m.$ns === "payment-detail" && m.$id === "pd3-2");
            assert.strictEqual(!!pd2, true);

            let oo = nodes.find(m => m.$ns === "owner" && m.$id === "oo3-1");
            assert.strictEqual(!!oo, true);

            //verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-3");
        });

        it("4", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.orderid === "o3" && p.id === "p3-3"
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("5", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.operator == null
            });

            assert.strictEqual(nodes.length, 12);
        });

        it("6", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.operator == undefined
            });

            assert.strictEqual(nodes.length, 12);
        });
    });

    describe("Compare ==", function () {
        it("1", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-1",
                $ns: "payment",
                expression: p => p.amount == 2500
            });

            assert.strictEqual(nodes.length, 6);
        });

        it("2", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.operator === null
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("3", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.operator === undefined
            });

            assert.strictEqual(nodes.length, 12);
        });

        it("4", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-4",
                $ns: "payment",
                expression: p => p.operator === undefined && p.operator === null
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("5 - all", () => {
            let nodes = kodo.explore<Order>({
                $id: "startup",
                $ns: "order",
                expression: p => ["o1", "o2", "o3", "o4"].findIndex(m => m === p.id) >= 0
            });

            assert.strictEqual(nodes.length, 11);
        });
    });
});