# Browser client boundary

The browser client owns document encryption/decryption, private metadata, device private keys, and the decision to sign a trace event.

Do not place plaintext document data, decrypted titles/comments, or document keys in server-rendered payloads, server actions, analytics, error reports, or API control-plane requests. The web application is intentionally not scaffolded beyond this boundary until the versioned client cryptography contract and test vectors are approved.
