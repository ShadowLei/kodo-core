import { Kodo, MemoryProvider, NodeTranslator } from "../src";
import { initKodoTestExpressionData } from "./_common";
import { Order, Payment, PaymentDetail, OrderOwner } from "./_modules";
import * as assert from "assert";

let kodo = new Kodo("my-test-net", {
    cache: false
});

describe("EQ Expression Test", function () {
    before(function () {
        initKodoTestExpressionData(kodo);
    });

    describe("Null Test", function () {
        it("1", () => {
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
            let nodes = kodo.explore<Order>({
                $id: "startup",
                $ns: "order",
                expression: p => p.operator != null
            });

            assert.strictEqual(nodes.length, 8);
        });
    });
});