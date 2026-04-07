# React Native Patterns

## Theme And Tokens

- Prefer semantic tokens from `apps/mobile/src/lib/mobileTheme.ts`.
- If a new durable visual rule appears more than once, move it into theme tokens or a shared primitive.
- Avoid local color math inside leaf components unless the primitive owns that behavior.

## Cursor Cards

- Reuse `CursorCardShell` for property-card wrappers.
- Reuse `CursorCardAction` for footer CTAs when the interaction pattern matches.
- Pass `ambientBackgroundColor` from the parent screen or timeline when the host background is known.
- Keep the ambient frame decorative with `pointerEvents="none"`.

## Layout

- Keep route files thin and feature modules orchestration-first.
- Use RTL-friendly row composition like `flex-row-reverse` where appropriate.
- Keep touch targets at or above 44px.
- Prefer calm spacing and border structure over stacked decorative containers.

## Interaction

- Keep one primary action visually dominant.
- If body press opens detail and CTA triggers an in-thread action, make both obvious and non-conflicting.
- Avoid gesture-heavy novelty patterns unless explicitly requested by product.

## Composer

- Keep the composer visually quiet at rest.
- Reuse `MobilePromptInputShell` and `MobilePromptInputStatus` before building a one-off chat input shell.
- Use one main multiline prompt surface instead of stacking separate text and action cards.
- Prefer a dynamic trailing action: mic when empty, send when the draft has content, stop when recording.
- Keep voice permission, recording, upload, and transcription states inline and compact.
- Recording mode should expand into a symmetric layout with centered waveform/timer and explicit pause/stop controls.
- Do not add fake tool buttons or search entry points that the app cannot actually fulfill.

## Documentation

- Update `docs/handbook/mobile/ai-ux-principles.md` when introducing a new persistent mobile AI pattern.
- Update `apps/mobile/system_ui_design.json` for stable design-system rules that another agent or generator should inherit.
