# notification-rules Specification

## Purpose

Defines how declarative notification rules are matched against query results and how violations trigger notifications.

## Requirements

### Requirement: Rules are expressed as JSON documents

A notification rule SHALL be representable as a JSON document with a stable identifier, an optional target namespace, an expectation quantifier, a matching predicate, and a notification configuration.

#### Scenario: A rule targets one namespace

- **WHEN** a rule specifies a target namespace
- **THEN** only result nodes in that namespace are evaluated against the rule

#### Scenario: A rule with no target namespace evaluates all nodes

- **WHEN** a rule omits the target namespace
- **THEN** all result nodes are evaluated against the rule

### Requirement: Matching predicate reuses query expression syntax

The matching predicate of a rule SHALL use the same field-condition syntax as query expressions, including boolean combination with `$with`, nesting with `$where`, and field comparisons with `$op` and `$val`.

#### Scenario: Field comparison predicate

- **WHEN** a rule's predicate compares a field using an operator and a value
- **THEN** each node's data is evaluated against that comparison

#### Scenario: Nested boolean predicate

- **WHEN** a rule's predicate combines sub-expressions with `$with` and `$where`
- **THEN** the combined predicate is evaluated against each node

### Requirement: Quantifier defines match failure

The rule's `expect` quantifier SHALL determine whether a result set matches: `all` requires every evaluated node to satisfy the predicate, `any` requires at least one, and `none` requires zero. The default SHALL be `all`.

#### Scenario: all fails on any violation

- **WHEN** `expect` is `all` and at least one node does not satisfy the predicate
- **THEN** the rule fails to match

#### Scenario: any fails when nothing matches

- **WHEN** `expect` is `any` and no node satisfies the predicate
- **THEN** the rule fails to match

#### Scenario: none fails on any match

- **WHEN** `expect` is `none` and at least one node satisfies the predicate
- **THEN** the rule fails to match

### Requirement: Failed rules trigger a notification

When a rule fails to match, the system SHALL deliver a notification through the configured channels; when no channels are configured, the notification SHALL be a no-op.

#### Scenario: No-op notification

- **WHEN** a rule fails to match and no notification channels are configured
- **THEN** the system invokes a no-op notification and reports the violation

### Requirement: Violations are reported

When a rule fails to match, the system SHALL return the violated rule together with the nodes that caused the failure.

#### Scenario: Violation includes offending nodes

- **WHEN** a rule fails to match
- **THEN** the reported result includes the rule and the offending nodes

### Requirement: Undecidable evaluations are ignored

A node whose predicate evaluation cannot be decided SHALL be ignored and SHALL NOT count as a violation.

#### Scenario: Undecidable node does not cause failure

- **WHEN** a node's predicate evaluation is undecidable
- **THEN** the node is neither a match nor a violation

### Requirement: Empty result set semantics per quantifier

For an empty evaluated set, `all` and `none` SHALL match with no violation, and `any` SHALL fail to match.

#### Scenario: Empty set with all

- **WHEN** the evaluated set is empty and `expect` is `all`
- **THEN** the rule matches with no violation

#### Scenario: Empty set with any

- **WHEN** the evaluated set is empty and `expect` is `any`
- **THEN** the rule fails to match

#### Scenario: Empty set with none

- **WHEN** the evaluated set is empty and `expect` is `none`
- **THEN** the rule matches with no violation
