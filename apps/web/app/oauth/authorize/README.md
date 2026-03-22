# OAuth Authorize Zone

This route owns the first-party OAuth consent experience at `/oauth/authorize`.

## Belongs Here
- consent-specific UI under `_components`
- route-local loaders and actions
- helper functions for flow redirects and consent decisions

## Boundary Rule
- Do not import this route's `_components` from other zones.
- If another surface ever needs shared OAuth UI, expose it through an explicit public entrypoint first.
