import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Riyadh is UTC+3 year-round, so 12:00 PM Asia/Riyadh maps to 09:00 UTC.
 */
crons.daily(
  "daily buyer conversation analyzer",
  {
    hourUTC: 9,
    minuteUTC: 0,
  },
  internal.ai_zone.conversationAnalyzer.runDailyNoonConversationAnalyzer,
  {},
);

export default crons;
