## Server Contracts

This folder defines the stable shapes shared by the Next.js backend gateway:

- request validation schemas
- response DTOs
- normalized domain errors

Domain services and API routes should depend on these contracts instead of raw Convex payloads.
