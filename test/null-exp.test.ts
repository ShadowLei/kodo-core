import { Kodo, MemoryProvider, NodeTranslator } from "../src";
import { initKodoTestExpressionData, strictEqual } from "./_common";
import { Order, Payment, PaymentDetail, OrderOwner } from "./_modules";
import { describe, test } from 'bun:test';

let kodo = new Kodo("my-test-net", {
    cache: false
});
initKodoTestExpressionData(kodo);

describe("Null Test", function () {
    test("1", () => {
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "payment",
            expression: p => p.id == null
        });

        strictEqual(nodes.length, 0);
    });

    test("2", () => {
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "payment",
            expression: p => p.operator != null
        });

        strictEqual(nodes.length, 0);
    });

    test("3", () => {
        let nodes = kodo.explore<Payment>({
            $id: "startup",
            $ns: "payment",
            expression: p => p.operator != null
        });

        strictEqual(nodes.length, 0);
    });

    test("4", () => {
        let nodes = kodo.explore<Order>({
            $id: "startup",
            $ns: "order",
            expression: p => p.operator != null
        });

        strictEqual(nodes.length, 8);
    });
});