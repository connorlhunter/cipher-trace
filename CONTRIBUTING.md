# Contributing

Create a branch from main, keep the change focused, and open a pull request.

Every pull request except one opened by Dependabot must link a Cipher Trace issue with a recognized phrase such as Closes #<issue-number> or Related to #<issue-number>.

Run uv sync --all-groups once after cloning. Run uv run ruff check . and uv run pytest before opening or updating a pull request. CI runs the same checks and scans Python and GitHub Actions with CodeQL.

Branches use <type>/<kebab-case-name>. Commit, issue, and pull-request subjects use <type>[(scope)][!]: <imperative summary>, where <type> is feat, fix, chore, docs, test, or refactor. Issue forms supply the appropriate prefix.

Release branches use release/<version>, release-preparation commits use chore(release): prepare <version>, and release tags use v<version>. Dependabot branches are accepted as dependabot/*. These rules apply to new work; existing Git history remains unchanged.

Do not commit credentials, tokens, document plaintext, document keys, real encrypted customer artifacts, local environment files, or generated build output.

Open an architecture decision issue before changing a security boundary, privacy claim, trace/event format, approval semantics, data model, deployment shape, or supported platform. A passing build is not permission to publish a release.
