# Proposal

## Why

The `recursion` option currently de-duplicates namespaces using a global check (`DataNodeMap.existNS`), which wrongly prunes namespaces that are legitimately reachable through different branches of the data graph. This produces incomplete results for `recursion: false` queries.

## What Changes

- `Kodo.loopExplore` will, when `recursion: false`, stop on namespace cycles detected along the current `fromDN` chain instead of the global namespace set.
- Consolidate the duplicated `recursion` branches in `loopExplore` (the parallel and sequential translate loops are merged into a single gather + dispatch).
- Update the `recursion: false` test expectations across the general, ORM, meta, and DynamoDB suites (results change from 5 to 6 nodes).

## Capabilities

### New Capabilities
- `graph-exploration`: how Kodo recursively traverses the data graph and decides when to stop following links (cycle detection and de-duplication).

### Modified Capabilities
<!-- none -->

## Impact

- `src/kodo.ts`: recursion de-duplication and loop structure.
- Tests: `test/general/opt.test.ts`, `test/orm/opt.test.ts`, `test/meta/opt-meta.test.ts`, `test/ddb/opt.test.ts`.
- No public API or dependency changes.
