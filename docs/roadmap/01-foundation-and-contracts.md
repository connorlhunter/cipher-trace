# Phase 1: Repository foundation and versioned contracts

## Outcome

The repository has a reproducible Python/FastAPI foundation and versioned contract discipline before product endpoints exist.

## Ordered work

- Pin the Python runtime, dependency policy, lint/test/type-check commands, CodeQL, and CI workflow.
- Establish FastAPI API, browser client, worker, contract, infrastructure, ADR, and test boundaries.
- Define opaque identifiers, bounded control-plane payloads, OpenAPI conventions, error semantics, and idempotency rules.
- Define versioned encrypted-revision, key-envelope, and trace-event schemas without placing plaintext fields in public models.
- Add ingress tests that fail if a plaintext document, title, comment, document key, or deterministic plaintext commitment enters a server contract.

## Exit evidence

- A new contributor can bootstrap, lint, type-check, and test the scaffold without cloud credentials.
- Contract fixtures have one deterministic encoding and version.
- CI rejects unsafe request shapes and unreviewed security-boundary changes.

## Non-negotiable constraints

- API Gateway and FastAPI receive JSON control data only.
- No in-process background work is treated as durable Lambda work.
- No schema is accepted solely because a single client can parse it; versioned fixtures must be portable across clients.
