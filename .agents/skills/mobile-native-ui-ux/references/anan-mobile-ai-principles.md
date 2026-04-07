# Anan Mobile AI Principles

## Experience Goals

- Calm
- Trustworthy
- Arabic-first
- Actionable
- Structurally premium

## Assistant Rules

- Assistant narration should be readable before it becomes container-heavy.
- User bubbles can be stronger and denser; assistant content should breathe more.
- Follow-up prompts should narrow the next step, not add playful noise.
- Session/privacy state must be explicit when it changes user expectations.

## Composer Rules

- Keep one main multiline prompt surface at rest.
- Switch the trailing action between mic and send based on whether the draft is empty.
- Keep voice and processing states inline and compact.
- Do not add decorative helper chrome around the composer unless it carries real state.

## Property Card Rules

- Use one shared cursor-card shell for shortlist/search property cards.
- Keep cards vertical.
- Keep the edge fade ambient-aware and adaptive to light/dark mode.
- Keep one explicit CTA per card.
- Preserve stable content order: image, title, price, location, facts, CTA.

## RTL Rules

- Default to right alignment and RTL.
- Switch to LTR only for Latin-leading content, code-like input, or clearly technical text.
- Mirror with intent; do not degrade hierarchy or scan order.

## Failure And Escalation

- Errors should stay compact and actionable.
- Empty states should still point to a next step.
- Human escalation should feel like support, not failure theater.
