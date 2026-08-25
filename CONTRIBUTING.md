# Contributing

Create a branch from main, keep the change focused, and open a pull request.

Every pull request except one opened by Dependabot must link a Cipher Trace issue with a recognized phrase such as Closes #<issue-number> or Related to #<issue-number>.

Install Bun 1.3.14, Python 3.12+, and uv. Run bun run bootstrap once after cloning, then bun run verify before opening or updating a pull request. The command validates repository naming, linked contracts, formatting, TypeScript, Python, and tests without cloud credentials.

Branches use <type>/<kebab-case-name>. Commit, issue, and pull-request subjects use <type>[(scope)][!]: <imperative summary>, where <type> is feat, fix, chore, docs, test, or refactor. Issue forms supply the appropriate prefix.

Release branches use release/<version>, release-preparation commits use chore(release): prepare <version>, and release tags use v<version>. Dependabot branches are accepted as dependabot/*. These rules apply to new work; existing Git history remains unchanged.

Do not commit credentials, tokens, document plaintext, document keys, real encrypted customer artifacts, local environment files, or generated build output.

Open an architecture decision issue before changing a security boundary, privacy claim, trace/event format, approval semantics, data model, deployment shape, or supported platform. A passing build is not permission to publish a release.
