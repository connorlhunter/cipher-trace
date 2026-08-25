# Phase 6: Revision-bound approvals and client experience

## Outcome

Authorized users can decrypt a revision locally, see the exact trace target, and sign a review decision that is valid only for that immutable ciphertext revision and policy context.

## Ordered work

- Build client-only encrypted revision viewing, local decryption, and safe error handling.
- Build review request, reviewer assignment, and clear exact-revision selection workflows.
- Create approval-granted, changes-requested, and approval-revoked event flows that bind revision id, revision event hash, ciphertext digest, policy version, and prior trace head.
- Enforce distinct-account, role, order, and threshold policy conditions.
- Build trace export and independent client verification for provenance evidence.

## Exit evidence

- UI/protocol tests demonstrate that a reviewer is shown the decrypted target revision and trace target before signing.
- A later revision cannot inherit approval satisfaction from a previous revision.
- Multiple devices for one account do not bypass a distinct-account policy.

## Non-negotiable constraints

- The browser client, not SSR or a server action, decrypts document content.
- The service cannot infer whether a reviewer read or understood plaintext.
- Approval status never replaces the immutable approval trace.
