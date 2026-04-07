# Mobile AI UX Principles

This document defines the buyer-facing mobile AI interaction rules for Anan.

It extends the base mobile design system with research-backed guidance for conversational UI, cursor-style property cards, and React Native implementation choices.

## Core Position

Anan mobile AI should feel:

- calm, not theatrical
- structured, not cluttered
- Arabic-first, not RTL-retrofitted
- helpful, not anthropomorphic
- premium, not glossy

The assistant is a task partner for property discovery and qualification. It is not a character.

## Product Principles

### 1. Keep the assistant low-noise

- Prefer one strong next step over multiple competing actions.
- Avoid decorative gradients, floating chrome, or card stacks that do not improve decision-making.
- Keep assistant copy readable and typographic before adding containers.

### 2. Preserve trust through visible structure

- Clearly separate user messages, assistant narration, structured cards, and follow-up prompts.
- Use borders and spacing as the primary structural language.
- Show privacy or control states explicitly when they matter to the session.

### 3. Make property cards feel native to the conversation

- Use one shared cursor-card shell for assistant shortlist cards, search-result cards, and AG-UI property cards.
- Let the wrapper edge fade from the ambient screen background into transparency so cards sit inside the conversation instead of looking pasted on top of it.
- Keep the content model stable: image, title, price, location, key facts, and one clear CTA.
- Chat property cards may host an inline swipeable media viewer, but the fullscreen gallery should remain the immersive destination when the user wants to inspect media closely.

### 4. Respect RTL as the default interaction model

- Default to right alignment and RTL writing direction.
- Switch to LTR only when content clearly starts in Latin script, numbers, or technical input.
- Never mirror layouts mechanically if it harms price scanning or action clarity.

### 5. Control before personality

- The user should always understand what the next action will do.
- Follow-up prompts should help the user move forward, not entertain.
- Avoid copy that implies emotional dependence or human intimacy.

### 6. Graceful failure is part of the design

- Empty states, missing results, and model uncertainty should still produce a clear next step.
- Error handling should stay inline and compact whenever possible.
- If the assistant cannot complete a step, route to a human or a clearer query path quickly.

### 7. The composer should stay focused

- Keep the primary input surface calm and compact at rest.
- Prefer one main prompt field with dynamic mic/send behavior over multiple permanent buttons.
- Show mode or processing banners only when the state changes user expectations.
- If a task outgrows normal chat, move the user into a dedicated workspace rather than overloading the composer itself.
- In recording mode, keep the waveform and elapsed time on the same centered row inside one capsule; avoid dropping the timer or helper text onto a second line.

### 8. New-thread state should be minimal

- Keep the new-thread screen close to the ChatGPT pattern: centered brand, generous whitespace, and broad prompt starters.
- Remove explainer cards, capability grids, and extra section chrome unless they unlock a concrete task.
- Starter prompts should do the teaching; the screen should not repeat that teaching in additional containers.

## React Native Implementation Rules

- Reuse shared primitives before inventing a new mobile card style.
- Pass the ambient background color into cursor-card shells when the parent surface differs from the default screen canvas.
- Keep edge fades decorative only with `pointerEvents="none"`.
- Prefer semantic theme tokens in `mobileTheme.ts` over inline color math in components.
- Keep touch targets at or above 44px.
- Keep motion subtle and purposeful; do not add decorative motion to property cards.
- Keep the composer input multiline but visually centered at rest.
- Switch the trailing action from mic to send based on whether the draft is empty.
- Keep voice recording and upload/transcription states inline instead of spawning a second heavy surface.
- When recording starts, keep the control state simple: cancel, centered waveform/timer, and stop-to-convert.
- Make the recording row geometrically balanced: equal-weight side actions, one centered waveform/timer cluster, and no stacked secondary status inside the active recorder itself.

## Card Rules

- Cursor cards stay in a vertical flow. Do not switch them to carousel or stacked-deck patterns unless a new product decision explicitly requires it.
- Each card should expose one explicit CTA.
- Body press and CTA press may differ, but the visual hierarchy must make the main action obvious.
- If a card includes swipeable media, image interaction should stay separate from the body press so swiping or tapping the image does not accidentally trigger detail navigation.
- The edge fade should adapt to light and dark mode without introducing a second accent palette.

## Research Basis

- OpenAI ChatGPT Search supports low-friction answers with cited web sources, which informs trust and follow-up behavior in assistant cards.
- OpenAI Temporary Chat emphasizes explicit privacy state, which informs visible session-state design.
- Google PAIR emphasizes mental models, explainability, feedback/control, and graceful failure for AI systems.
- Apple HIG reinforces hierarchy, harmony, and consistency across native surfaces.
- Android design guidance reinforces adaptive layout quality, privacy, and touch-friendly mobile behavior.
- MIT/OpenAI wellbeing reporting is a reminder to keep AI task-focused and avoid dependence-oriented interaction patterns.

## Source Links

- OpenAI ChatGPT Search: https://help.openai.com/en/articles/9237897-chatgpt-search/
- OpenAI Temporary Chat: https://help.openai.com/en/articles/9295248
- Google PAIR Guidebook: https://pair.withgoogle.com/old-gb/
- Google PAIR Feedback + Control: https://pair.withgoogle.com/guidebook-v2/chapters/feedback-controls/
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Android Design: https://developer.android.com/design
- MIT Media Lab summary: https://www.media.mit.edu/articles/chatgpt-may-be-making-us-lonelier/
