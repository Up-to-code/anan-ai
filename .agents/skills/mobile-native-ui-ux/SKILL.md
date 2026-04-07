---
name: mobile-native-ui-ux
description: Use when working on Anan mobile buyer UI, React Native interaction patterns, assistant/search property cards, or mobile AI UX principles. Covers cursor-card rules, RTL-first behavior, ambient fades, and documentation/research references for future mobile work.
---

# Mobile Native UI/UX

Use this skill for buyer-facing mobile UI work in `apps/mobile`, especially assistant/search experiences, property cards, and React Native interaction design.

## Read First

1. `.agents/skills/anan-platform-knowledge/SKILL.md`
2. `apps/mobile/README.md`
3. `docs/handbook/mobile/ai-ux-principles.md`

Read the references in this skill only when needed:

- `references/anan-mobile-ai-principles.md` for the distilled Anan rules
- `references/react-native-patterns.md` for implementation conventions
- `references/research-basis.md` for the web-researched rationale

## Workflow

1. Confirm the surface:
   - buyer assistant timeline
   - search results
   - property detail support UI
   - shared mobile primitive
2. Prefer existing mobile primitives before introducing a new card or wrapper.
3. If the change affects property cards, use the shared cursor-card shell instead of re-implementing borders, radii, and fades locally.
4. If the change affects the chat input, reuse the shared prompt-input primitives before styling a new composer shell.
5. Pass the ambient background color into cursor-card shells whenever the parent surface differs from the default mobile canvas.
6. Keep the composer calm at rest: one main prompt field, dynamic mic/send action, and inline voice/processing states.
7. Preserve Arabic-first alignment and switch to LTR only when the content clearly starts in Latin script or technical input.
8. Update `apps/mobile/system_ui_design.json` or `docs/handbook/mobile/ai-ux-principles.md` when you introduce a new durable mobile AI pattern.

## Hard Rules

- Do not introduce a second mobile property-card visual language.
- Do not introduce a second mobile composer model for the same buyer assistant surface.
- Do not turn buyer shortlist cards into carousels or stacked decks unless the product explicitly changes direction.
- Do not use decorative gradients that compete with content; ambient fades should help cards sit in the background, not advertise themselves.
- Do not hard-code one-off colors when `mobileTheme.ts` can own the semantic token.
- Keep assistant interactions task-focused and avoid anthropomorphic copy or behavior.

## Implementation Notes

- Shared mobile property cards should expose one clear CTA.
- Body press and CTA press can differ when the user needs both “open details” and “act on this property”.
- Edge fades must be decorative only and must not intercept touch input.
- Chat inputs should expose at most two visible idle actions, typically the draft field plus a dynamic mic/send action.
- Voice permission, upload, and transcription states should stay inline and explicit.
- Empty, error, and low-confidence states should still give the user a clear next step.
