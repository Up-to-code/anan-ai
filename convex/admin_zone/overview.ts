import { query } from "../_generated/server";
import { adminChecker } from "../shared_logic/lib/adminChecker";

export const overviewStats = query({
  args: {},
  handler: async (ctx) => {
    await adminChecker(ctx, "read");
    const [
      usersCount,
      propertiesCount,
      banksCount,
      knowledgeCount,
      researchCount,
      logsAll,
    ] = await Promise.all([
      ctx.db.query("users").collect().then((r) => r.length),
      ctx.db.query("properties").collect().then((r) => r.length),
      ctx.db.query("banks").collect().then((r) => r.length),
      ctx.db.query("knowledgePages").collect().then((r) => r.length),
      ctx.db.query("knowledgeResearch").collect().then((r) => r.length),
      ctx.db.query("searchLogs").collect(),
    ]);
    const searchLogsTotal = logsAll.length;
    const searchLogsFailed = logsAll.filter(
      (l) => l.status === "failed" || (l.errorMessage && l.errorMessage.length > 0)
    ).length;
    return {
      users: usersCount,
      properties: propertiesCount,
      banks: banksCount,
      knowledgePages: knowledgeCount,
      knowledgeResearch: researchCount,
      searchLogsTotal,
      searchLogsFailed,
    };
  },
});
