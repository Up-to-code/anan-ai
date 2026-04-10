# BuyerEntryScreen

Routes first-run users into auth or the assistant home, and returning users into the active buyer workspace.

- `index.tsx` decides between redirects and `BuyerAssistantHomeScreen` using the persisted buyer account contract.
