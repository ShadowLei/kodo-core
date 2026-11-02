# Tasks

## 1. Extract the shared matcher

- [x] 1.1 Create `src/utils/expressionMatcher.ts` by moving `MatchResult`, `isMatchData`, `matchOnData`, `match`, and `isAllMatchWith` out of `MemoryProvider` as pure exported functions; verify `bun test ./test/general/*.test.ts` still passes.
- [x] 1.2 Refactor `MemoryProvider` to import and use the shared matcher with no behavior change; verify `bun test` passes across all suites.

## 2. Rule model and evaluator

- [x] 2.1 Add `src/notify/rule.ts` defining `RuleExpect` (`"all" | "any" | "none"`) and `NotificationRule<T>`; verify `bun run build:types` succeeds.
- [x] 2.2 Add `src/notify/evaluator.ts` implementing `evaluateRule(rule, nodes)` with target namespace filtering, tri-state (`true | false | "defer"`) handling, quantifier logic (`all`/`any`/`none` default `all`), and empty-set semantics; verify its unit tests pass.

## 3. Notifier and engine

- [x] 3.1 Add `src/notify/notifier.ts` with an `INotifier` interface and a `NoopNotifier` no-op implementation; verify `bun run build:types` succeeds.
- [x] 3.2 Add `src/notify/notificationEngine.ts` that evaluates each rule and calls the notifier for violations; verify its unit tests pass.

## 4. Kodo API and exports

- [x] 4.1 Add `checkRules(rules, nodes?)` to `Kodo` that accepts an optional notifier and returns violation details; verify a test calling `kodo.checkRules` passes.
- [x] 4.2 Export the new modules from `src/notify/index.ts` and `src/index.ts`; verify `bun run build` succeeds.

## 5. Tests

- [x] 5.1 Add `test/notify/rule.test.ts` covering `all`/`any`/`none`, target namespace filtering, empty result sets, `defer` handling, nested `$with`/`$where` predicates, and `IN`/`!IN` operators; verify `bun test ./test/notify/*.test.ts` passes.
- [x] 5.2 Run the full `bun test` suite to confirm no regressions.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
