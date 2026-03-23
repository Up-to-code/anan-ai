# ClientHistoryPage

Owns the authenticated-only history view for locally saved client assistant sessions.

In version 1 this page intentionally keeps history lightweight:

- requires sign-in at the UI boundary
- reads saved snapshots from local storage
- surfaces summaries and timestamps without rebuilding a full CRM timeline
