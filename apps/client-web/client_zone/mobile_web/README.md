# Mobile Web

- `lib/` owns the mobile-to-web view helpers, data normalizers, and formatting utilities.
- `components/` owns the shared mobile-style web primitives used across every buyer route.
- `screens/` owns one screen-level component per mobile route we expose in `apps/client-web`.

This folder exists to make `apps/client-web` follow the mobile buyer application instead of the older desktop-oriented client web shell. Keep route files thin and keep all mobile-first UI behavior here.
