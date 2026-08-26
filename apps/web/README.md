# Cipher Trace web client

This is the client-only web base for Cipher Trace. It uses React, TanStack Router, and Vite. The base currently has one local route and no API client, authentication flow, upload flow, analytics, or document handling.

## Run locally

From the repository root:

```sh
bun install
bun run dev:web
```

Build the client with:

```sh
bun run --cwd apps/web build
```

The build uses `tsgo`, the native TypeScript compiler, before Vite creates the
browser bundle.

The router is code-based for this foundation. It has no generated route tree and no server-rendered routes. Add routes only when the related client and protocol issue is ready.

## Security boundary

The browser client will own document encryption and decryption, private metadata, device private keys, and the decision to sign a trace event.

Do not place plaintext document data, decrypted titles or comments, document keys, or sensitive metadata in Vite environment values, route loaders, server-rendered payloads, analytics, error reports, or API control-plane requests. The FastAPI service receives only the approved opaque control-plane data.
