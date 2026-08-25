# Phase 8: Assurance and private-alpha readiness

## Outcome

Cipher Trace has evidence for a constrained private alpha, clear limitations, and a plan for independent review before broad security claims.

## Ordered work

- Run compatibility, adversarial crypto-format, stale-head concurrency, Lambda retry, load/fault, and projection-rebuild suites.
- Test accessible client workflows, local decryption errors, authorization loss, review conflict, and key-revocation states.
- Audit dependencies and supply-chain controls; publish a release evidence bundle and known-limitations record.
- Define alpha enrollment, user support boundaries, acceptance criteria, rollback criteria, and exit criteria.
- Prepare an independent cryptographic/security assessment scope and remediate findings before a broad public E2EE claim.

## Exit evidence

- A signed release candidate has reproducible build/test evidence and an incident/rollback decision record.
- Alpha participants receive accurate privacy and recovery limitations.
- The product avoids claims that exceed reviewed guarantees.

## Non-negotiable constraints

- Private alpha is not evidence of a completed security review.
- Never collect real document content for test, support, telemetry, or debugging purposes.
- Do not add key escrow, plaintext inspection, or external anchoring as an expedient for launch.
