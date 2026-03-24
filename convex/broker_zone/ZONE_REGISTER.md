# `broker_zone` Register

## Top-Level Ownership
- `overview.ts`: broker dashboard counters
- `properties.ts`: broker property query/mutation surface
- `repositories/overviewRepository.ts`: overview data access
- `repositories/propertiesRepository.ts`: broker-owned property persistence

## Important Exports
- `countPropertiesByBrokerId`
- `listByBrokerId`, `getById`, `create`, `update`, `remove`, `publish`
- Repository helpers such as `listPropertiesByBrokerId` and `createBrokerProperty`

## Main Consumers
- `apps/web/server/broker_zone/*`
- tests and internal backend callers using generated refs

## Public Vs Internal
- Public: handler files at the zone root
- Internal: repository implementation details
