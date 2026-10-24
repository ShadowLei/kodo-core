import { describe, test, expect } from 'bun:test';
import { Kodo } from "../../src";
import { Order } from "../_module";
import { initKodoTestData } from "./_ddb_link";
import { strictEqual } from "../_common";

let flatKodo = new Kodo("ddb-null-flat", { cache: false, tierLimit: 1 });
initKodoTestData(flatKodo);

describe("Null 处理 (filter)", () => {
    // Order: o1(operator=null), o2(operator=null), o3(operator=Shadow), o4(operator=Allen)

    test("operator == null (o1 为 NULL → 匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o1", operator: { $op: "==", $val: null } }
        });

        strictEqual(nodes.length, 1);
        strictEqual(!!nodes.find(m => m.$id === "o1"), true);
    });

    test("operator == null (o3 非 NULL → 不匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", operator: { $op: "==", $val: null } }
        });

        strictEqual(nodes.length, 0);
    });

    test("operator === null (o1 为 NULL → 匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o1", operator: { $op: "===", $val: null } }
        });

        strictEqual(nodes.length, 1);
    });

    test("operator != null (o1 为 NULL → 不匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o1", operator: { $op: "!=", $val: null } }
        });

        strictEqual(nodes.length, 0);
    });

    test("operator != null (o3 非 NULL → 匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", operator: { $op: "!=", $val: null } }
        });

        strictEqual(nodes.length, 1);
    });

    test("operator !== null (o3 非 NULL → 匹配)", async () => {
        let nodes = await flatKodo.explore<Order>({
            $ns: "Order",
            expression: { id: "o3", operator: { $op: "!==", $val: null } }
        });

        strictEqual(nodes.length, 1);
    });
});

describe("Null 作为 partition key (抛异常)", () => {
    test("Order.id == null", async () => {
        expect(
            flatKodo.explore<Order>({ $ns: "Order", expression: { id: null } })
        ).rejects.toThrow(/partition key/);
    });

    test("Order.id == undefined", async () => {
        expect(
            flatKodo.explore<Order>({ $ns: "Order", expression: { id: undefined } })
        ).rejects.toThrow(/partition key/);
    });
});
