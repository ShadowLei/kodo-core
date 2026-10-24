import { describe, test, expect } from 'bun:test';
import { Kodo } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestData } from "./_ddb_link";

let kodo = new Kodo("ddb-scan", { cache: false, tierLimit: 1 });
initKodoTestData(kodo);

describe("Scan 保护 (缺少 partition key 抛异常)", () => {
    test("Payment.amount == 1300 (无 pk)", async () => {
        expect(
            kodo.explore<Payment>({ $ns: "Payment", expression: { amount: 1300 } })
        ).rejects.toThrow(/requires the partition key/);
    });

    test("Order.logid == shadow (无 pk)", async () => {
        expect(
            kodo.explore<Order>({ $ns: "Order", expression: { logid: "shadow" } })
        ).rejects.toThrow(/requires the partition key/);
    });

    test("Order.operator == Shadow (无 pk)", async () => {
        expect(
            kodo.explore<Order>({ $ns: "Order", expression: { operator: "Shadow" } })
        ).rejects.toThrow(/requires the partition key/);
    });
});

describe("Scan 保护 (partition key 非相等比较抛异常)", () => {
    test("Order.id > o1 (范围比较)", async () => {
        expect(
            kodo.explore<Order>({ $ns: "Order", expression: { id: { $op: ">", $val: "o1" } } })
        ).rejects.toThrow(/cannot be OR-ed or range-compared/);
    });

    test("Order.id >= o1", async () => {
        expect(
            kodo.explore<Order>({ $ns: "Order", expression: { id: { $op: ">=", $val: "o1" } } })
        ).rejects.toThrow(/cannot be OR-ed or range-compared/);
    });

    test("Order.id < o2", async () => {
        expect(
            kodo.explore<Order>({ $ns: "Order", expression: { id: { $op: "<", $val: "o2" } } })
        ).rejects.toThrow(/cannot be OR-ed or range-compared/);
    });

    test("Order.id <= o2", async () => {
        expect(
            kodo.explore<Order>({ $ns: "Order", expression: { id: { $op: "<=", $val: "o2" } } })
        ).rejects.toThrow(/cannot be OR-ed or range-compared/);
    });

    test("Order.id != o1 (不等于)", async () => {
        expect(
            kodo.explore<Order>({ $ns: "Order", expression: { id: { $op: "!=", $val: "o1" } } })
        ).rejects.toThrow(/cannot be OR-ed or range-compared/);
    });

    test("Order.id !IN [...] (排除集合)", async () => {
        expect(
            kodo.explore<Order>({ $ns: "Order", expression: { id: { $op: "!IN", $val: ["o1"] } } })
        ).rejects.toThrow(/cannot be OR-ed or range-compared/);
    });
});

describe("Scan 保护 (partition key 被 OR 抛异常)", () => {
    test("$with: || , id=o1, logid=111", async () => {
        expect(
            kodo.explore<Order>({
                $ns: "Order",
                expression: { $with: "||", id: "o1", logid: "111" }
            })
        ).rejects.toThrow(/cannot be OR-ed or range-compared/);
    });
});

describe("其他异常", () => {
    test("function predicate 不支持", async () => {
        expect(
            kodo.explore<Order>({ $ns: "Order", expression: () => true })
        ).rejects.toThrow(/function predicate/);
    });

    test("不存在的 namespace", async () => {
        expect(
            kodo.explore<any>({ $ns: "Nope", expression: { id: "x" } })
        ).rejects.toThrow(/no table configured/);
    });
});
