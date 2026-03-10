# OAuth Core

This folder contains the low-level OAuth/OIDC primitives for Anan:

- scope registry and token lifetimes
- cryptographic helpers
- JWT signing and verification
- HTTP endpoint orchestration for the authorization server

Business logic and database writes live in `convex/shared_logic/oauth/`.
