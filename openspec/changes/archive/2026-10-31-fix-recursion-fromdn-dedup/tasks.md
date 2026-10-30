# Tasks

## 1. Core fix

- [x] 1.1 Add a `hasNamespaceInPath` helper to `Kodo` and replace the global `existNS` check in `loopExplore` with `!recursion && hasNamespaceInPath(startup)`; verify the `recursion: false` cases in `test/general/opt.test.ts` now return 6 nodes
- [x] 1.2 Consolidate the parallel/sequential translate loops in `loopExplore` into a single gather + dispatch, preserving sequential execution for `recursion: false`; verify `bun run build` type-checks

## 2. Test updates

- [x] 2.1 Update `test/general/opt.test.ts` and `test/general/opt-exp.test.ts` `recursion: false` expectations (5→6 nodes with `pd3-2` present; 6→8 for the non-expression suite; 6→11 for the expression suite); verify with `bun test ./test/general/*.test.ts`
- [x] 2.2 Update `test/orm/opt.test.ts` the same way (5→6, `pd3-2` present, 6→8); verify with `bun test ./test/orm/opt.test.ts`
- [x] 2.3 Update `test/meta/opt-meta.test.ts` and `test/meta/opt-exp-meta.test.ts` the same way (5→6, `pd3-2` present, 6→8 non-expression, 6→11 expression); verify with `bun test ./test/meta/*.test.ts`
- [x] 2.4 Update `test/ddb/opt.test.ts` the same way (5→6, keep the no-scan-exception assertion); verify it still type-checks (running requires AWS credentials)

## 3. Integration check

- [x] 3.1 Run `bun test ./test/general/*.test.ts ./test/orm/*.test.ts ./test/meta/*.test.ts` and confirm all pass
