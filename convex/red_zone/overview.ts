import { query } from "../_generated/server";
import { REDChecker } from "../shared_logic/lib/REDChecker";
import { overviewStatsService } from "./services/overviewService";

export const overviewStats = query({
  args: {},
  handler: async (ctx) => {
    const { REDId } = await REDChecker(ctx);
    return await overviewStatsService(ctx, { REDId });
  },
});
