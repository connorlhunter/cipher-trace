# Infrastructure boundary

Infrastructure is intentionally deferred until the protocol and control-plane contracts are tested. The target topology is API Gateway HTTP API, FastAPI/Mangum on Lambda, separate Python ciphertext-confirmation and trace-projection Lambdas, Cognito, private S3, DynamoDB, and least-privilege IAM.

KMS/S3 encryption at rest is defense in depth for ciphertext only. No infrastructure role may decrypt a user document or access a plaintext document key.
