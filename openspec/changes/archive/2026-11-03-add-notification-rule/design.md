# Design

## Context

`kodo.explore(startup)` returns `DataNode<any>[]`. Each node carries a namespace (`$ns`), an identifier (`$id`), and the raw result data (`data`). Filtering during a query already uses `QueryExpression`, which is either a predicate function or an object form built from field conditions (`{ $op, $val }` or a bare value), boolean combination (`$with`), and nesting (`$where`). `MemoryProvider` already contains a working matcher that evaluates a `QueryExpression` against a data object and returns `true | false | "defer"`.

See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**

- Reuse the existing `QueryExpression` object form as the rule predicate, so rule authors already know the syntax and rules stay JSON-maintainable.
- Give rules a quantifier (`expect`) that decides, over the result set, what "does not match" means.
- Extract the matcher in `MemoryProvider` into a shared module so rules and providers share one implementation.
- Provide a pluggable notifier with a no-op default so concrete channels can be added later.

**Non-Goals:**

- Implementing real notification channels (email, webhook, etc.) — channels are stubbed.
- Adding a `count` quantifier — deferred until a concrete need appears.
- Auto-checking rules inside `explore()` — the API is explicit for now.
- Introducing a new rule DSL — the existing expression language is reused.

## Decisions

- **Reuse `QueryExpression` as the matching predicate.** Rationale: it already expresses field comparisons, `&&`/`||`, and nesting, and it serializes cleanly to JSON. Alternative considered: a new rule DSL — rejected because it would duplicate operators and add maintenance and learning cost.

- **Drive match failure with an `expect` quantifier (`all` / `any` / `none`, default `all`).** Rationale: one schema field covers the three real cases — invariant violations, missing-data alerts, and anomaly detection. Alternative considered: hardcoding only `all` — rejected as too narrow.

- **Extract the `MemoryProvider` matcher into a shared pure module.** Rationale: a single source of truth for predicate evaluation. Alternative considered: duplicating the logic in the notify layer — rejected due to divergence risk.

- **Expose an explicit `checkRules(rules, nodes)` API on `Kodo`.** Rationale: it decouples rule evaluation from graph traversal and caching, and it is directly testable. Alternative considered: auto-invoking rules inside `explore()` — rejected because it couples unrelated responsibilities and complicates the cache lifecycle.

- **Define a `notifier` abstraction with a no-op default.** Rationale: notification delivery is orthogonal to matching and can be swapped later. Alternative considered: logging inline — rejected because it is not pluggable.

## Risks / Trade-offs

- [Extracting the matcher could change `MemoryProvider` behavior] → run the existing test suite as a regression check after the refactor.
- [Predicate functions are not JSON-serializable] → the object form is the JSON path; predicate functions remain available only for code-defined rules.
- [`defer` evaluation semantics may surprise users] → documented in the spec as "ignored, not a violation".
- [`count` quantifier is unsupported] → deferred; the schema can be extended later without breaking existing rules.

## Migration Plan

No migration is required: the change is additive and does not alter existing query or expression APIs. Rollback is a revert of the change commit.

## Open Questions

- Whether multiple violations should be aggregated into one notification or delivered per violated rule (deferred until a concrete channel exists).
- The exact JSON shape of a future `count` quantifier (threshold + comparison operator).
