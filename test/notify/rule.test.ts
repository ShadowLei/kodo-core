import { describe, test, expect } from "bun:test";
import {
    DataNode,
    evaluateRule,
    INotifier,
    Kodo,
    NotificationEngine,
    NotificationRule,
    RuleViolation,
} from "../../src";

function node(ns: string, id: string, data: any): DataNode<any> {
    const n = new DataNode();
    n.$ns = ns;
    n.$id = id;
    n.data = data;
    return n;
}

const payments: DataNode<any>[] = [
    node("Payment", "p1", { id: "p1", amount: 100 }),
    node("Payment", "p2", { id: "p2", amount: 3000 }),
    node("Payment", "p3", { id: "p3", amount: 200 }),
];

function rule(overrides: Partial<NotificationRule> = {}): NotificationRule {
    return {
        id: "r1",
        expect: "all",
        match: { amount: { $op: "<=", $val: 2500 } },
        ...overrides,
    };
}

describe("evaluateRule - all", () => {
    test("passes when every node satisfies the predicate", () => {
        const r = rule({ match: { amount: { $op: ">=", $val: 0 } } });
        expect(evaluateRule(r, payments)).toBeNull();
    });

    test("fails when any node violates and reports the offending nodes", () => {
        const r = rule({ match: { amount: { $op: "<=", $val: 2500 } } });
        const v = evaluateRule(r, payments);
        expect(v).not.toBeNull();
        expect(v!.rule.id).toBe("r1");
        expect(v!.violated.map(n => n.$id)).toEqual(["p2"]);
    });

    test("passes on an empty evaluated set", () => {
        expect(evaluateRule(rule(), [])).toBeNull();
    });
});

describe("evaluateRule - any", () => {
    test("passes when at least one node satisfies the predicate", () => {
        const r = rule({ expect: "any", match: { amount: { $op: ">", $val: 2000 } } });
        expect(evaluateRule(r, payments)).toBeNull();
    });

    test("fails when no node satisfies the predicate", () => {
        const r = rule({ expect: "any", match: { amount: { $op: ">", $val: 9999 } } });
        const v = evaluateRule(r, payments);
        expect(v).not.toBeNull();
        expect(v!.violated.length).toEqual(3);
    });

    test("fails on an empty evaluated set", () => {
        expect(evaluateRule(rule({ expect: "any" }), [])).not.toBeNull();
    });
});

describe("evaluateRule - none", () => {
    test("passes when no node satisfies the predicate", () => {
        const r = rule({ expect: "none", match: { amount: { $op: ">", $val: 9999 } } });
        expect(evaluateRule(r, payments)).toBeNull();
    });

    test("fails when any node satisfies the predicate and reports the matching nodes", () => {
        const r = rule({ expect: "none", match: { amount: { $op: ">", $val: 2000 } } });
        const v = evaluateRule(r, payments);
        expect(v).not.toBeNull();
        expect(v!.violated.map(n => n.$id)).toEqual(["p2"]);
    });

    test("passes on an empty evaluated set", () => {
        expect(evaluateRule(rule({ expect: "none" }), [])).toBeNull();
    });
});

describe("evaluateRule - target namespace", () => {
    const mixed = [
        node("Payment", "p1", { id: "p1", amount: 100 }),
        node("Order", "o1", { id: "o1", amount: 99999 }),
    ];

    test("only evaluates nodes in the target namespace", () => {
        const r = rule({ $ns: "Payment", match: { amount: { $op: "<=", $val: 2500 } } });
        expect(evaluateRule(r, mixed)).toBeNull();
    });

    test("evaluates all nodes when no namespace is given", () => {
        const r = rule({ match: { amount: { $op: "<=", $val: 2500 } } });
        const v = evaluateRule(r, mixed);
        expect(v).not.toBeNull();
        expect(v!.violated.map(n => n.$id)).toEqual(["o1"]);
    });
});

describe("evaluateRule - defer is ignored", () => {
    test("all with an empty predicate does not violate", () => {
        const r = rule({ match: {} });
        expect(evaluateRule(r, payments)).toBeNull();
    });

    test("any with an empty predicate violates (nothing matched)", () => {
        const r = rule({ expect: "any", match: {} });
        expect(evaluateRule(r, payments)).not.toBeNull();
    });
});

describe("evaluateRule - nested and operators", () => {
    test("nested $with / $where predicate", () => {
        const r = rule({
            match: {
                $where: [
                    { amount: { $op: ">", $val: 2000 } },
                ],
            },
        });
        const v = evaluateRule(r, payments);
        expect(v).not.toBeNull();
        expect(v!.violated.map(n => n.$id)).toEqual(["p1", "p3"]);
    });

    test("IN operator", () => {
        const r = rule({ expect: "all", match: { id: { $op: "IN", $val: ["p1", "p2", "p3"] } } });
        expect(evaluateRule(r, payments)).toBeNull();
    });

    test("!IN operator", () => {
        const r = rule({ expect: "none", match: { id: { $op: "!IN", $val: ["p1", "p2"] } } });
        const v = evaluateRule(r, payments);
        expect(v).not.toBeNull();
        expect(v!.violated.map(n => n.$id)).toEqual(["p3"]);
    });
});

describe("evaluateRule - disabled rules", () => {
    test("disabled rules are skipped", () => {
        const r = rule({ active: false, match: { amount: { $op: "<=", $val: 2500 } } });
        expect(evaluateRule(r, payments)).toBeNull();
    });
});

describe("NotificationEngine", () => {
    test("notifies for each violated rule", async () => {
        const engine = new NotificationEngine();
        const rules = [
            rule({ id: "ok", match: { amount: { $op: ">=", $val: 0 } } }),
            rule({ id: "bad", match: { amount: { $op: "<=", $val: 2500 } } }),
        ];

        const violations = await engine.check(rules, payments);

        expect(violations.length).toBe(1);
        expect(violations[0].rule.id).toBe("bad");
    });
});

describe("Kodo.checkRules", () => {
    test("evaluates the provided nodes and returns violations", async () => {
        const kodo = new Kodo("test-notify");
        const violations: RuleViolation[] = await kodo.checkRules(
            [rule({ match: { amount: { $op: "<=", $val: 2500 } } })],
            payments,
        );

        expect(violations.length).toBe(1);
        expect(violations[0].violated.map(n => n.$id)).toEqual(["p2"]);
    });
});
