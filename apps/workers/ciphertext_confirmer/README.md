# Ciphertext confirmer Lambda

This worker is triggered by private S3 object creation. It may inspect object facts such as key, size, content type, encryption-at-rest metadata, and the complete ciphertext SHA-256 checksum. It must not fetch, decrypt, parse, log, or transform document plaintext.

Its writes must be idempotent because S3 event delivery can be duplicated.
