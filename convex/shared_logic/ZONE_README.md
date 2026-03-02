# shared_logic Zone

## Ownership
This folder owns shared_logic features only.

## Public API
- Export only entry components/handlers/hooks from this zone.
- Cross-zone reusable logic must move to shared modules.

## Allowed Imports
- Same zone modules.
- Core infrastructure primitives.
- Shared logic modules for reusable domain logic.

## Forbidden
- Deep imports from another feature zone.
- Duplicating business logic that already exists in shared modules.

## Examples
- Good: page -> zone hook -> shared service.
- Bad: page imports another zone's page/hook directly.
