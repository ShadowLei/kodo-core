# Spec Delta

## Purpose

Defines how Kodo traverses the data graph and decides when to stop following links to avoid re-querying namespaces.

## ADDED Requirements

### Requirement: Non-recursive traversal de-duplicates per path

When the `recursion` option is false, Kodo SHALL continue exploring links from a node unless the target namespace already appears among the node's ancestors on the current path, in which case it SHALL stop that branch.

#### Scenario: Namespace reached through two separate branches is queried per branch

- **WHEN** exploring an `Order` with two `Payment` nodes, each linked to its own `PaymentDetail`, using `recursion: false`
- **THEN** `PaymentDetail` is queried once per `Payment` branch and both `PaymentDetail` nodes are returned

#### Scenario: Link back to an ancestor namespace is not followed

- **WHEN** a link points from a node back to a namespace that already appears earlier on the same path
- **THEN** Kodo stops that branch without issuing the lookup

### Requirement: Recursive traversal de-duplicates by node identity

When the `recursion` option is true, Kodo SHALL follow every link reachable from the start node and de-duplicate results by node identity, so each distinct node is returned exactly once.

#### Scenario: Full graph traversal returns each reachable node once

- **WHEN** exploring a node with `recursion: true`
- **THEN** every node reachable through the links is returned exactly once
