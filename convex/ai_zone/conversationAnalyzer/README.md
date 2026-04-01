# conversationAnalyzer

## Purpose
Daily buyer-conversation analysis for market intelligence.

## Responsibilities
- Register eligible buyer threads for the next noon analysis window.
- Extract normalized demand signals from completed buyer transcripts.
- Aggregate per-chat outputs into one daily summary record.
- Feed completed conversation demand back into shared market analytics.

## Structure
- `constants.ts`: shared analyzer constants and eligible assistant kinds.
- `time.ts`: Riyadh-noon window helpers and run-key generation.
- `types.ts`: analyzer payload and transcript types.
- `extract.ts`: transcript-to-demand-signal extraction.
- `aggregate.ts`: per-day rollup helpers.
- `registration.ts`: lightweight draft registration during transcript persistence.

## Notes
- This module analyzes buyer conversations only.
- It is intentionally batch-oriented; live assistant turns should stay lightweight.
