# Design

## Context

`Kodo.loopExplore` currently branches on `opt.recursion` in two places: an early `if (!recursion) { if (nodes.existNS(startup.$ns)) return; }` that consults the global namespace map, and a later `if (recursion) { parallel } else { sequential }` that runs two nearly identical translate loops.

The node graph already carries full ancestry: `QueryNode.$fromDN` points at the data node that produced it, and `DataNode.$fromQN` points back at the query that produced that data node. Walking `startup.$fromDN → $fromQN → $fromDN → …` yields the path from the root to the current query, which is exactly what is needed for per-path cycle detection.

## Goals / Non-Goals

**Goals:**
- Make `recursion: false` de-duplicate per path (fromDN chain) instead of globally.
- Remove the duplicated translate loops between the parallel and sequential branches.

**Non-Goals:**
- Changing `recursion: true` behavior (full graph, node-identity de-duplication).
- Removing the parallel-vs-sequential execution distinction.
- Changing the `tierLimit` or `limit` options.

## Decisions

### Path-based cycle detection

Add `hasNamespaceInPath(startup)` that walks `startup.$fromDN` and its `$fromQN.$fromDN` ancestors, returning true when an ancestor's `$ns` equals `startup.$ns`. Replace the global `existNS` check with `if (!this.opt.recursion && this.hasNamespaceInPath(startup)) return;`.

- Alternative: keep the global `existNS` check — rejected because it prunes namespaces reached through separate, legitimate branches.

### Merge the recursion dispatch

Extract the duplicated `dn × translators → translate` loops into a single `gatherNext(foundList)` that returns all translated query nodes. Then dispatch: `recursion: true` fans out with `Promise.all`, while `recursion: false` awaits each gathered query node in order (preserving the original strictly-sequential execution, so provider lookups are still issued one subtree at a time).

- Alternative: leave both branches duplicated — rejected as redundant.

## Risks / Trade-offs

- [Result change] `recursion: false` now returns 6 nodes instead of 5 for the existing fixtures → update the four test suites to match.
- [DynamoDB scan exception] the reverse `PaymentDetail → Payment` link must still be pruned by the path check → verified by the existing "avoid scan exception" test, which keeps passing (only the node count changes).
