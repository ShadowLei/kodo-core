# Proposal

## Why

Kodo can query and traverse a data graph, but it has no way to verify the results against expected conditions or alert an operator when something is off. Operators need a declarative, JSON-maintainable way to define rules that get checked against `explore()` results and trigger a notification when the results fail those rules.

## What Changes

- Introduce a declarative notification rule model expressed as JSON, reusing the existing `QueryExpression` syntax (`$with` / `$where` / field conditions with `$op` and `$val`) as the matching predicate so rule authors already know the language.
- Add rule evaluation semantics driven by a quantifier field `expect` (`all` / `any` / `none`, default `all`) to decide whether a result set "matches" or "does not match" the rule.
- Add a notifier abstraction with an empty (no-op) implementation for now; concrete channels such as email are deferred.
- Expose a `checkRules(rules, nodes)` API on `Kodo` that evaluates rules against `DataNode<any>[]` results and reports violations.
- Extract the existing expression matcher in `MemoryProvider` into a shared module so rules and providers reuse a single implementation.

## Capabilities

### New Capabilities

- `notification-rules`: declarative rules that are matched against query results and trigger notifications when violated.

### Modified Capabilities

<!-- No existing capability requirements change. -->

## Impact

- Affected code: `src/kodo.ts`, `src/providers/memoryProvider.ts`, new `src/notify/*` modules, and `src/index.ts` exports.
- No breaking changes to existing query or expression APIs.
- No new runtime dependencies: notifier channels are stubbed.
