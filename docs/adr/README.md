# Architecture decision records

Use one record per durable decision. Start with the Architecture decision issue template, resolve the decision in review, then add a numbered ADR before implementation depends on it.

~~~text
# ADR-0001: <decision>

## Context

## Decision

## Consequences

## Security and privacy boundary

## Follow-up
~~~

Decisions that change the encryption boundary, plaintext-handling rule, signature/canonicalization format, key lifecycle, trace semantics, approval policy, data model, or deployment topology require a new record.
