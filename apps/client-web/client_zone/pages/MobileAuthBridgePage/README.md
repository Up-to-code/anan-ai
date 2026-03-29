# Mobile Auth Bridge Page

Owns the browser bridge used by the native mobile app for authenticated buyer actions.

- accepts the serialized mobile guest transcript payload from the Expo app
- reuses the existing Convex Auth sign-in flow
- seeds buyer thread history after sign-in
- optionally creates the qualified advisor handoff
- deep-links back into `anan-mobile://account`
