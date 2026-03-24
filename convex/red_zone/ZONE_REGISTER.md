# `red_zone` Register

## Top-Level Ownership
- `overview.ts`: developer dashboard counters
- `properties.ts`: developer property query/mutation surface
- `repositories/overviewRepository.ts`: overview data access
- `repositories/propertiesRepository.ts`: developer-owned property persistence

## Important Exports
- `countPropertiesByRedId`
- `listByRedId`, `getById`, `create`, `update`, `remove`, `publish`
- Repository helpers such as `listPropertiesByRedId` and `createRedProperty`

## Main Consumers
- `apps/web/server/red_zone/*`
- tests and internal backend callers using generated refs

## Public Vs Internal
- Public: handler files at the zone root
- Internal: repository implementation details
