# Workspace UI `inbox` Register

## Top-Level Ownership
- `page.tsx`, `layout.tsx`, `loading.tsx`: route entrypoints
- `pages/InboxPage/InboxWorkspaceClient.tsx`: main inbox client orchestrator
- `pages/InboxPage/useRealtimeInbox.ts`: realtime inbox state hook
- `pages/InboxPage/InboxThreadView.tsx`: thread detail view
- `pages/InboxPage/components/*`: inbox-local interactive components
- `[conversationId]/page.tsx`: focused thread route wrapper

## Important Exports
- `InboxWorkspaceClient`
- `useRealtimeInbox`, `useWorkspaceSignalCounts`
- `InboxThreadView`
- inbox-local helper exports such as composer key/send helpers

## Main Consumers
- inbox route entry files
- inbox-local components and tests

## Public Vs Internal
- Public inside the zone: workspace client, realtime hook, thread view
- Internal: component-level inbox widgets under `pages/InboxPage/components/`
