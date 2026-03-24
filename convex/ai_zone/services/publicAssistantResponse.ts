const DEFAULT_TARGET_MIN = 320;
const DEFAULT_SOFT_CAP = 700;
const DEFAULT_HARD_CAP = 900;
const DEFAULT_MAX_SENTENCES = 5;

type CompactAssistantResponseOptions = {
  targetMin?: number;
  softCap?: number;
  hardCap?: number;
  maxSentences?: number;
};

export type CompactAssistantResponseResult = {
  text: string;
  changed: boolean;
  sentenceCount: number;
  originalLength: number;
};

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?؟])\s+|\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * WHY:   The public voice assistant needs spoken answers that stay compact even when the model runs long.
 * WHAT:  Trims long assistant text into a medium-compact spoken form while preserving the leading factual answer.
 * HOW:   Normalizes whitespace, keeps the earliest complete sentences first, and enforces soft and hard length caps.
 */
export function compactAssistantResponse(
  text: string,
  options: CompactAssistantResponseOptions = {},
): CompactAssistantResponseResult {
  const normalized = normalizeWhitespace(text);
  const originalLength = normalized.length;
  const targetMin = options.targetMin ?? DEFAULT_TARGET_MIN;
  const softCap = options.softCap ?? DEFAULT_SOFT_CAP;
  const hardCap = options.hardCap ?? DEFAULT_HARD_CAP;
  const maxSentences = options.maxSentences ?? DEFAULT_MAX_SENTENCES;

  if (!normalized) {
    return {
      text: "",
      changed: text !== "",
      sentenceCount: 0,
      originalLength,
    };
  }

  const sentences = splitSentences(normalized);
  let compacted = normalized;

  if (sentences.length > maxSentences || normalized.length > softCap) {
    const kept: string[] = [];
    for (const sentence of sentences) {
      const next = kept.length > 0 ? `${kept.join(" ")} ${sentence}` : sentence;
      if (kept.length >= maxSentences) break;
      if (next.length > softCap && next.length >= targetMin) break;
      kept.push(sentence);
    }

    compacted = kept.join(" ").trim() || sentences.slice(0, maxSentences).join(" ").trim() || normalized;
  }

  if (compacted.length > hardCap) {
    compacted = compacted.slice(0, hardCap).replace(/\s+\S*$/, "").trim();
    if (!/[.!?؟]$/.test(compacted)) {
      compacted = `${compacted}.`;
    }
  }

  return {
    text: compacted,
    changed: compacted !== normalized,
    sentenceCount: splitSentences(compacted).length,
    originalLength,
  };
}
