# `public_zone` Register

## Top-Level Ownership
- `contact.ts`: contact inquiry mutation
- `forms.ts`: public form submission mutation

## Important Exports
- `createContactInquiry`
- `submitForm`

## Main Consumers
- public web pages and unauthenticated route handlers

## Public Vs Internal
- Public: both root handler files
- Internal: implementation details inside the handlers themselves
