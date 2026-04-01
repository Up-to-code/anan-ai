import {
  CONVERSATION_ANALYZER_LOCAL_NOON_HOUR,
  CONVERSATION_ANALYZER_TIMEZONE,
  CONVERSATION_ANALYZER_WINDOW_MS,
  RIYADH_UTC_OFFSET_MS,
} from "./constants";
import type { ConversationAnalyzerWindow } from "./types";

function buildShiftedDate(timestampMs: number) {
  return new Date(timestampMs + RIYADH_UTC_OFFSET_MS);
}

function buildShiftedLocalNoonMs(timestampMs: number) {
  const shifted = buildShiftedDate(timestampMs);
  return Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
    CONVERSATION_ANALYZER_LOCAL_NOON_HOUR,
    0,
    0,
    0,
  );
}

function toUtcFromShifted(shiftedMs: number) {
  return shiftedMs - RIYADH_UTC_OFFSET_MS;
}

/**
 * WHY:   Draft registration needs to know which noon batch owns the current buyer conversation turn.
 * WHAT:  Returns the next Riyadh-noon analysis window after the provided timestamp.
 * HOW:   Converts the timestamp into Riyadh local time using the fixed UTC+3 offset, then maps it to the next local noon boundary.
 */
export function getNextConversationAnalyzerWindow(
  timestampMs: number,
): ConversationAnalyzerWindow {
  const shiftedTimestamp = timestampMs + RIYADH_UTC_OFFSET_MS;
  const shiftedLocalNoonMs = buildShiftedLocalNoonMs(timestampMs);
  const shiftedWindowEndMs =
    shiftedTimestamp < shiftedLocalNoonMs
      ? shiftedLocalNoonMs
      : shiftedLocalNoonMs + CONVERSATION_ANALYZER_WINDOW_MS;
  const windowEndMs = toUtcFromShifted(shiftedWindowEndMs);
  return {
    runKey: buildConversationAnalyzerRunKey(windowEndMs),
    windowStartMs: windowEndMs - CONVERSATION_ANALYZER_WINDOW_MS,
    windowEndMs,
    timezone: CONVERSATION_ANALYZER_TIMEZONE,
  };
}

/**
 * WHY:   The noon cron should process a stable trailing 24-hour window even if the action is replayed or manually rerun later.
 * WHAT:  Returns the most recent completed Riyadh-noon window at or before the provided timestamp.
 * HOW:   Resolves the latest local noon boundary and backs the window start off by exactly 24 hours.
 */
export function getLatestCompletedConversationAnalyzerWindow(
  timestampMs: number,
): ConversationAnalyzerWindow {
  const shiftedTimestamp = timestampMs + RIYADH_UTC_OFFSET_MS;
  const shiftedLocalNoonMs = buildShiftedLocalNoonMs(timestampMs);
  const shiftedWindowEndMs =
    shiftedTimestamp < shiftedLocalNoonMs
      ? shiftedLocalNoonMs - CONVERSATION_ANALYZER_WINDOW_MS
      : shiftedLocalNoonMs;
  const windowEndMs = toUtcFromShifted(shiftedWindowEndMs);
  return {
    runKey: buildConversationAnalyzerRunKey(windowEndMs),
    windowStartMs: windowEndMs - CONVERSATION_ANALYZER_WINDOW_MS,
    windowEndMs,
    timezone: CONVERSATION_ANALYZER_TIMEZONE,
  };
}

/**
 * WHY:   Every daily analyzer run needs one canonical id so reruns update the same record instead of duplicating it.
 * WHAT:  Builds a stable run key from the Riyadh-noon window end boundary.
 * HOW:   Uses the UTC ISO string for the boundary because it is deterministic and ASCII-safe.
 */
export function buildConversationAnalyzerRunKey(windowEndMs: number) {
  return `riyadh-noon-${new Date(windowEndMs).toISOString()}`;
}
