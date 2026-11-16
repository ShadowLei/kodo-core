import { ConsoleNotifier, DataNode, INotifier, Kodo, KodoNotifier, NotificationRule, QueryMatch } from "../../src";
import { Order, Payment } from "../_module";
import { initKodoTestData } from "./_orm_link";
// import { initKodoTestData } from "../orm/_orm_link";
import { strictEqual } from "../_common";
import { describe, test } from "bun:test";

let kodo = new Kodo("notify-explore", { cache: false, recursion: false });
initKodoTestData(kodo);

let kodoNotifier = new KodoNotifier();
kodoNotifier.registerNotifier(new ConsoleNotifier());

function rule(exp: string): NotificationRule {
    return {
        id: "r", 
        matchExpression: exp
    };
}

describe("explore + all quantifier", async () => {

    let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });

    test("every Payment amount <= 2500 passes", async () => {
        strictEqual(nodes.length, 6);
        let violations = await kodoNotifier.validate([rule(`
            nodes
                .filter(n, n["$ns"] == "Payment")
                .all(n, n.data.amount <= 2500)
        `)], nodes);
        strictEqual(violations.length, 0);
    });

    test("every Payment amount <= 2400 not passes", async () => {
        strictEqual(nodes.length, 6);

        let violations = await kodoNotifier.validate([rule(`
            nodes
                .filter(n, n.$ns == "Payment")
                .all(n, n.data.amount <= 2400)
        `)], nodes);
        strictEqual(violations.length, 1);
    });

    test("check id", async () => {
        let violations = await kodoNotifier.validate([rule(`
            join(sort(nodes
                .filter(n, n.$ns == "Payment")
                .map(n, string(n.$id))
            ))
            == "p3-1,p3-2"
            `)], nodes);
        strictEqual(violations.length, 0);
    });

    test("check size", async () => {
        let violations = await kodoNotifier.validate([rule(`
            nodes.size() == 6`)], nodes);
        strictEqual(violations.length, 0);
    });

    test("check $from-1", async () => {
        let violations = await kodoNotifier.validate([rule(`
            flat(nodes
                .filter(n, n.$ns == "Payment")
                .map(n, n.$from.map(m, m.$id))
            ) == ["o3", "o3"]
        `
        )], nodes);
        strictEqual(violations.length, 0);
    });

    test("check $from-2", async () => {
        let violations = await kodoNotifier.validate([rule(`
            nodes
                .filter(n, n.$ns == "Payment")[0].$from[0].$id
            == "o3"
        `
        )], nodes);
        strictEqual(violations.length, 0);
    });

    test("check $to-1", async () => {
        let violations = await kodoNotifier.validate([rule(`
            flat(nodes
                .filter(n, n.$ns == "Payment")
                .map(n, n.$to.map(m, m.$id))
            ) == [ "pd3-1", "pd3-2" ]
        `
        )], nodes);
        strictEqual(violations.length, 0);
    });

    test("check $to-2", async () => {
        let violations = await kodoNotifier.validate([rule(`
            nodes
                .filter(n, n.$ns == "Payment")[0].$to[0].$id
            == "pd3-1"
        `
        )], nodes);
        strictEqual(violations.length, 0);
    });
});

// describe("explore + any / none quantifier", () => {
//     test("any Payment amount > 2000 passes", async () => {
//         let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
//         let violations = await kodoNotifier.validate([rule({ expect: "any", match: { amount: { $op: ">", $val: 2000 } } })], nodes);
//         strictEqual(violations.length, 0);
//     });

//     test("any Payment amount > 9999 fails with no offending node", async () => {
//         let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
//         let violations = await kodoNotifier.validate([rule({ expect: "any", match: { amount: { $op: ">", $val: 9999 } } })], nodes);

//         strictEqual(violations.length, 1);
//         strictEqual(violations[0].violated.length, 2);
//     });

//     test("none Payment amount > 9999 passes", async () => {
//         let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
//         let violations = await kodoNotifier.validate([rule({ expect: "none", match: { amount: { $op: ">", $val: 9999 } } })], nodes);
//         strictEqual(violations.length, 0);
//     });

//     test("none Payment amount >= 2500 fails on p3-2", async () => {
//         let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
//         let violations = await kodoNotifier.validate([rule({ expect: "none", match: { amount: { $op: ">=", $val: 2500 } } })], nodes);
//         strictEqual(violations.length, 1);
//         strictEqual(ids(violations[0].violated), ["p3-2"]);
//     });
// });

// describe("explore + empty result set", () => {
//     test("empty result respects all/any/none semantics", async () => {
//         let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "nope" } });
//         strictEqual(nodes.length, 0);

//         let all = await kodoNotifier.validate([rule({ match: { amount: { $op: "<=", $val: 2500 } } })], nodes);
//         strictEqual(all.length, 0);

//         let any = await kodoNotifier.validate([rule({ expect: "any", match: { amount: { $op: "<=", $val: 2500 } } })], nodes);
//         strictEqual(any.length, 1);

//         let none = await kodoNotifier.validate([rule({ expect: "none", match: { amount: { $op: "<=", $val: 2500 } } })], nodes);
//         strictEqual(none.length, 0);
//     });
// });

// describe("checkRules defaults to last explore nodes", () => {
//     test("omitting nodes reuses the current node map", async () => {
//         await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
//         let violations = await kodoNotifier.validate([rule({ match: { amount: { $op: "<", $val: 2500 } } })]);
//         strictEqual(violations.length, 1);
//         strictEqual(ids(violations[0].violated), ["p3-2"]);
//     });
// });

// describe("checkRules notifies only on violations", () => {
//     test("notifier receives each violated rule", async () => {
//         let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });

//         let violations = await kodoNotifier.validate([
//             rule({ match: { amount: { $op: ">=", $val: 0 } } }),
//             rule({ match: { amount: { $op: "<", $val: 2500 } } }),
//         ], nodes);

//         strictEqual(violations.length, 1);
//     });
// });

// describe("explore + target namespace filtering", () => {
//     test("rules only evaluate their target namespace across mixed results", async () => {
//         let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
//         strictEqual(nodes.length, 6);

//         let ok = await kodoNotifier.validate([rule({ $ns: "PaymentDetail", match: { amount: { $op: "<=", $val: 2800 } } })], nodes);
//         strictEqual(ok.length, 0);

//         let bad = await kodoNotifier.validate([rule({ $ns: "PaymentDetail", match: { amount: { $op: "<", $val: 2800 } } })], nodes);
//         strictEqual(bad.length, 1);
//         strictEqual(ids(bad[0].violated), ["pd3-2"]);

//         let owner = await kodoNotifier.validate([rule({ $ns: "OrderOwner", expect: "any", match: { name: "LPSV0001" } })], nodes);
//         strictEqual(owner.length, 0);
//     });
// });

// describe("explore + nested and operator predicates", () => {
//     test("nested $where predicate", async () => {
//         let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
//         let violations = await kodoNotifier.validate([rule({ match: { $where: [{ amount: { $op: ">", $val: 2000 } }] } })], nodes);
//         strictEqual(violations.length, 1);
//         strictEqual(ids(violations[0].violated), ["p3-1"]);
//     });

//     test("IN operator", async () => {
//         let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
//         let violations = await kodoNotifier.validate([rule({ match: { id: { $op: "IN", $val: ["p3-1", "p3-2"] } } })], nodes);
//         strictEqual(violations.length, 0);
//     });

//     test("!IN operator", async () => {
//         let nodes = await kodo.explore<Order>({ $ns: "Order", expression: { id: "o3" } });
//         let violations = await kodoNotifier.validate([rule({ expect: "none", match: { id: { $op: "!IN", $val: ["p3-1"] } } })], nodes);
//         strictEqual(violations.length, 1);
//         strictEqual(ids(violations[0].violated), ["p3-2"]);
//     });
// });

// describe("explore with filter expression then rule", () => {
//     test("rule checks only the payments returned by the filtered explore", async () => {
//         let nodes = await kodo.explore<Payment>({ $ns: "Payment", expression: { amount: { $op: ">=", $val: 2500 } } });

//         // Payments in the result: p3-2 (2500), px-1 (5600), px-2 (9000),
//         // plus p3-1 (1300) reached via the Order o3 link.
//         let violations = await kodoNotifier.validate([rule({ match: { amount: { $op: "<=", $val: 5000 } } })], nodes);
//         strictEqual(violations.length, 1);
//         strictEqual(ids(violations[0].violated), ["px-1", "px-2"]);
//     });
// });
