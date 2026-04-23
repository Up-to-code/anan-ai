# Public Forms Flowchart

This shows how public form submissions move from the web app into Convex, and how the form data is stored in the database.

## Submission Flow

```mermaid
flowchart TD
  A["Public web form"] --> B["POST /api/forms"]
  B --> C["Zod validation: submitPublicFormInputSchema"]
  C --> D{"Valid payload?"}
  D -- "No" --> E["Return 400 error"]
  D -- "Yes" --> F["createPublicFormSubmission service"]
  F --> G["convexFormsRepository.submit"]
  G --> H["Convex mutation: public_zone/forms.submitForm"]
  H --> I["Build rate-limit key from source IP or phone"]
  I --> J["enforceHttpRateLimit"]
  J --> K["Normalize fields: trim, limit length, lowercase email"]
  K --> L["JSON.stringify(data)"]
  L --> M{"Payload <= 5 KB?"}
  M -- "No" --> N["Throw INVALID_ARGUMENT"]
  M -- "Yes" --> O["Insert row into formSubmissions"]
  O --> P["Return { id }"]
```

## Current Form Contract

```mermaid
flowchart LR
  F["early-access form"] --> N["name: string"]
  F --> T["type: investor | broker | financial_broker | developer"]
  F --> P["phone: string"]
  F --> E["email?: string"]
```

## Database Schema

```mermaid
erDiagram
  formSubmissions {
    string formName "example: early-access"
    string data "JSON string of normalized form fields"
    string status "optional: new | reviewed | archived"
    string sourceIp "optional"
    string userAgent "optional"
    number createdAt "Date.now() timestamp"
  }
```

## Stored Row Shape

```ts
{
  formName: "early-access",
  data: "{\"name\":\"Ahmed\",\"type\":\"investor\",\"phone\":\"+966500000000\",\"email\":\"ahmed@example.com\"}",
  status: "new",
  sourceIp: "203.0.113.10",
  userAgent: "Mozilla/5.0 ...",
  createdAt: 1776811200000,
}
```

## Indexes

| Index | Fields | Main use |
| --- | --- | --- |
| `formName` | `formName` | Find submissions for one form type |
| `createdAt` | `createdAt` | List submissions by time |
| `formName_createdAt` | `formName`, `createdAt` | List one form type by time |

## Source Files

- `apps/web/app/api/forms/route.ts` receives the HTTP request.
- `apps/web/server/contracts/forms.ts` defines the public form contract.
- `apps/web/server/domains/public/forms/service.ts` owns the web domain service boundary.
- `apps/web/server/infrastructure/convex/public/forms/index.ts` calls Convex.
- `convex/public_zone/forms.ts` validates, rate-limits, normalizes, and inserts.
- `convex/_core/schema/forms.ts` defines the `formSubmissions` table.
