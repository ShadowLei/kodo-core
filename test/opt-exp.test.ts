import { Kodo, MemoryProvider, NodeTranslator } from "../src";
import { initKodoTestExpressionData } from "./_common";
import { Order, Payment, PaymentDetail, OrderOwner } from "./_modules";
import * as assert from "assert";

let kodo = new Kodo("my-test-net");

describe("Option Expression Test", function () {

    before(function () {
        initKodoTestExpressionData(kodo);
    });

    describe("Cache Test", function () {
        it("1", () => {
            kodo.setOption({ cache: false });
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "payment",
                expression: p => p.id == null
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("2", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "payment",
                expression: p => p.operator != null
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("3", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "payment",
                expression: p => p.operator != null
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("4", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "order",
                expression: o => o.operator != null
            });

            assert.strictEqual(nodes.length, 8);
        });

        it("5", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "order",
                expression: p => p.operator != null
            });

            assert.strictEqual(nodes.length, 8);
        });
    });

    describe("Recursion Test", function () {
        it("1", () => {
            kodo.setOption({ recursion: false });
            //kodo.setOption({ recursion: false });
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "payment",
                expression: p => p.id == null
            });

            //printNodes(nodes);

            assert.strictEqual(nodes.length, 0);
        });

        it("2", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "payment",
                expression: p => p.operator != null
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("3", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "payment",
                expression: p => p.operator != null
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("4", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "order",
                expression: o => true || o.operator != null
            });

            assert.strictEqual(nodes.length, 6);
        });
    });
    
    describe("TierLimit Test", function () {
        it("1", () => {
            kodo.setOption({ cache: false, recursion: true, tierLimit: 1 });
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-1",
                $ns: "payment",
                expression: p => p.amount === 2500
            });

            assert.strictEqual(nodes.length, 1);
        });

        it("2", () => {
            kodo.setOption({ cache: false, recursion: true, tierLimit: 10 });
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-1",
                $ns: "payment",
                expression: p => p.amount === 2500
            });

            assert.strictEqual(nodes.length, 6);
        });

        it("3", () => {
            kodo.setOption({ cache: false, recursion: true, tierLimit: 2 });
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-2",
                $ns: "payment",
                expression: p => p.orderid === "o3" && p.id === "p3-2"
            });

            assert.strictEqual(nodes.length, 3);
        });

        it("4", () => {
            kodo.setOption({ cache: false, recursion: true, tierLimit: 3 });
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-2",
                $ns: "payment",
                expression: p => p.orderid === "o3" && p.id === "p3-2"
            });

            //printNodes(nodes);

            assert.strictEqual(nodes.length, 5);
        });

        it("5", () => {
            kodo.setOption({ cache: false, recursion: true, tierLimit: 10 });
            let nodes = kodo.explore<Payment>({
                $id: "startup-eq-2",
                $ns: "payment",
                expression: p => p.orderid === "o3" && p.id === "p3-2"
            });

            //p3-2 | o3 | p3-1 | pd3-1 | oo3-1 | pd3-2
            //printNodes(nodes);

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

            //verifyIds(pd1, ["pd3-1", "p3-1", "o3", "p3-2"], "startup-eq-2");
        });
    });
});