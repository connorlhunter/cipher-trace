# Cipher Trace

Cipher Trace is an end-to-end encrypted document provenance and approval platform. Authorized clients encrypt and decrypt documents locally; the service verifies signed, hash-linked revision and workflow events without receiving document plaintext or document keys.

Project documentation, diagrams, and the published architecture:

<https://connorhunter.me/projects/cipher-trace?viewer=docs#project-viewer>

## Scope

Cipher Trace is designed to establish that an immutable ciphertext revision was created, linked to prior history, and approved by authorized signers under a versioned policy. It does not claim that the service can read, understand, compare, or recover document plaintext.

- Browser clients own document encryption, decryption, private metadata, and device private keys.
- FastAPI on API Gateway and AWS Lambda owns authenticated control-plane validation, policy checks, signed-trace verification, idempotency, and presigned S3 intents.
- Python Lambda workers confirm ciphertext object facts and build derived workflow projections.
- S3 stores ciphertext only. DynamoDB stores opaque records, public keys, encrypted key envelopes, immutable trace events, and derived status.

## Repository layout

~~~text
apps/
  api/                         FastAPI control-plane Lambda
  web/                         client-only encrypted document experience
  workers/                     ciphertext confirmer and trace projector boundaries
infra/                         AWS deployment and least-privilege IaC boundary
packages/trace_contracts/      versioned trace and ciphertext contract guidance
~~~

This repository starts as a security-conscious scaffold. It deliberately does not yet accept uploads, decrypt documents, create keys, or claim a production-ready cryptographic implementation.

## Development

Install Python 3.12+ and uv, then run:

~~~sh
uv sync --all-groups
uv run ruff check .
uv run pytest
~~~

The FastAPI skeleton exposes only a health endpoint:

~~~sh
uv run uvicorn app.main:app --app-dir apps/api --reload
~~~

The production Lambda entrypoint is apps/api/app/lambda_handler.py. The application must remain a JSON-only control plane: document bytes, plaintext metadata, and document keys do not belong in API Gateway, Lambda request bodies, logs, or error reports.

## Roadmap

The ordered delivery plan is in [ROADMAP.md](ROADMAP.md). The matching [GitHub Project](https://github.com/users/connorlhunter/projects/16) keeps phase and implementation issues visible. The published design reference is the Cipher Trace page linked above. Every phase has an explicit security/verification exit gate.

## Contribution rules

Run the local checks before opening a pull request. Branch names use:

~~~text
<type>/<kebab-case-name>
~~~

Commit, issue, and pull-request titles use:

~~~text
<type>[(scope)][!]: <imperative summary>
~~~

Allowed types are feat, fix, chore, docs, test, and refactor. Open an architecture decision issue before changing an encryption boundary, privacy claim, trace semantics, data model, deployment shape, or supported platform.

Never commit credentials, document plaintext, document keys, real encrypted customer artifacts, or generated build output. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
