# InboxPage

Realtime workspace inbox orchestration for `/ws/inbox`.

- `InboxWorkspaceClient.tsx`: thin page orchestrator that composes the sidebar, active thread, and mobile thread visibility state.
- `InboxThreadView.tsx`: thread-area orchestrator that wires the compact header, message list, and composer together.
- `components/InboxSidebar.tsx`: calmer inbox rail with search, compact incoming invites, and conversation switching.
- `components/InboxThreadHeader.tsx`: lightweight thread identity row with mobile back affordance.
- `components/InboxMessageList.tsx`: ordered message rendering with optimistic state support and offer-event cards.
- `components/InboxCollaborationCard.tsx`: compact card renderer for file, project, deal, invite, and role events inside the thread.
- `components/InboxComposer.tsx`: reply composer with auto-resize, send-state feedback, keyboard rules, and the broker/developer collaboration launcher.
- `components/InboxStates.tsx`: shared empty and loading states for the thread panel.
- `useRealtimeInbox.ts`: live Convex subscriptions, optimistic sending, route sync, and visibility-aware read handling.
