# Changelog

## [0.1.0-alpha.3] - 2026-08-27

### Added

- Project-owned coverage and changelog artifacts in JSON/PDF and Markdown/PDF formats.

### Changed

- Build both artifacts before publishing, then invalidate them together.

## [0.1.0-alpha.2] - 2026-08-26

### Changed

- Replaced separate TypeScript formatting, linting, and type-check commands with Vite+.
- Added Oxfmt, Oxlint, type-aware checks, and a 15-path complexity limit for application and contract source.

## [0.1.0-alpha.1] - 2026-08-26

### Added

- FastAPI and Lambda control-plane boundaries, worker placeholders, and shared Python and TypeScript trace contracts.
- A browser-only React, TanStack Router, and Vite client foundation.
- Matching TypeScript and Python coverage reports with 95% line and function gates in local checks and CI.
- Local CodeQL scans, a dependency policy, pinned toolchains, and shared quality checks.

### Changed

- Repository documentation now points to the published Cipher Trace architecture and diagrams.
- TypeScript type checks use `tsgo`, and the ESLint flat config is written in TypeScript.

### Known limits

- This is a repository foundation, not a production-ready encrypted document service.
- Client encryption, document-key envelopes, signatures, direct ciphertext transfer, trace persistence, approvals, and public-blockchain checkpoints are not implemented yet.
- Cipher Trace does not support document upload, decryption, key recovery, or a production security claim.
