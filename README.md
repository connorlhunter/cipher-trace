# Cipher Trace

Cipher Trace is an end-to-end encrypted document provenance and approval platform. Authorized clients encrypt and decrypt documents locally; the service verifies signed, hash-linked revision and workflow events without receiving document plaintext or document keys.

Project documentation, diagrams, and the published architecture:

<https://connorhunter.me/projects/cipher-trace?viewer=docs#project-viewer>

## Scope

Cipher Trace proves that a ciphertext revision was recorded in order and approved by allowed signers. It cannot read, understand, or judge the document.

DynamoDB is the live trace and workflow source of truth. A checkpoint worker periodically batches accepted event hashes into a Merkle root and anchors that root on a public blockchain. The checkpoint adds an external timestamp and tamper check. It never puts documents, ciphertext, names, keys, policies, or individual approvals on chain.

- Browser clients own document encryption, decryption, private metadata, and device private keys.
- FastAPI on API Gateway and AWS Lambda owns authenticated control-plane validation, policy checks, signed-trace verification, idempotency, and presigned S3 intents.
- Python Lambda workers confirm ciphertext object facts and build derived workflow projections.
- S3 stores ciphertext only. DynamoDB stores opaque records, public keys, encrypted key envelopes, immutable trace events, and derived status.
- A public blockchain stores periodic Merkle roots only. It does not run approvals, store documents, or require wallet login.

## Repository layout

```text
apps/
  api/                         FastAPI control-plane Lambda
  web/                         client-only encrypted document experience
  workers/                     ciphertext confirmer and trace projector boundaries
infra/                         AWS deployment and least-privilege IaC boundary
packages/python/               installable Python control-plane contracts
packages/typescript/           strict TypeScript trace-event contracts
scripts/                       developer workflow, naming, and issue-link checks
```

This repository starts as a security-conscious scaffold. It deliberately does not yet accept uploads, decrypt documents, create keys, or claim a production-ready cryptographic implementation.

## Development

Install Bun 1.3.14, Python 3.12, uv 0.12.6, and CodeQL CLI 2.26.3, then run:

```sh
bun run bootstrap
bun run verify
```

The bootstrap command installs Bun dependencies, syncs the Python workspace, and configures the repository hooks. The complete quality check validates naming, linked contracts, formatting, TypeScript, Python, tests, and local CodeQL security scans. CodeQL must resolve to the exact pinned CLI version on your PATH. It requires no cloud credentials.

The FastAPI skeleton exposes only a health endpoint:

```sh
uv run uvicorn app.main:app --app-dir apps/api --reload
```

The production Lambda entrypoint is apps/api/app/lambda_handler.py. The application must remain a JSON-only control plane: document bytes, plaintext metadata, and document keys do not belong in API Gateway, Lambda request bodies, logs, or error reports.

The Python and TypeScript libraries share a strict, structural trace-event envelope. They reject known plaintext and document-key field names, but deliberately do not implement encryption, signatures, canonical serialization, or ciphertext processing. Those protocol decisions remain gated by the roadmap and published architecture.

## Coverage

Both TypeScript and Python require at least 95% line and function coverage. Generate the matching overview, TypeScript, and Python reports with:

```sh
bun run coverage:build
```

The publication command renders the same report pages and PDFs, then uploads them when the artifact bucket environment variables are available:

```sh
bun run coverage:publish
```

## Roadmap

The ordered delivery plan is in [ROADMAP.md](ROADMAP.md). The matching [GitHub Project](https://github.com/users/connorlhunter/projects/16) keeps phase and implementation issues visible. The published design reference is the Cipher Trace page linked above. Every phase has an explicit security/verification exit gate.

## Contribution rules

Run the local checks before opening a pull request. Branch names use:

```text
<type>/<kebab-case-name>
```

Commit, issue, and pull-request titles use:

```text
<type>[(scope)][!]: <imperative summary>
```

Allowed types are feat, fix, chore, docs, test, and refactor. Open an architecture decision issue before changing an encryption boundary, privacy claim, trace semantics, data model, deployment shape, or supported platform.

Never commit credentials, document plaintext, document keys, real encrypted customer artifacts, or generated build output. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
