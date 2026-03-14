## Convex Adapters

These repository adapters are the only place where the web server layer should call Convex directly.

- Keep repository methods narrow and domain-oriented.
- Return stable DTOs instead of raw Convex mutation/query payloads.
- Hide token-based Convex transport details from domain services.
