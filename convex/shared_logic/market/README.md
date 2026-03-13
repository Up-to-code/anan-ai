This folder owns shared market-intelligence aggregation for the workspace market zone.

- `normalizers.ts`: canonical Saudi city parsing, area cleanup, feature normalization, and product-type inference.
- `analytics.ts`: converts raw `properties`, `knowledgeResearch`, and `searchLogs` rows into one stable market snapshot.
- `../market.ts`: public Convex query entrypoint consumed by the web server repository.

Rules:
- Keep this logic shared and audience-neutral.
- Do not fabricate metrics that are not supported by persisted data.
- Prefer explicit fallbacks over silently inferring unstable market claims.
