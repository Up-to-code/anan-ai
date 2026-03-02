import { query } from "../_generated/server";
import { brokerChecker } from "../shared_logic/lib/brokerChecker";
import { overviewStatsService } from "./services/overviewService";

export const overviewStats = query({
  args: {},
  handler: async (ctx) => {
    const { brokerId } = await brokerChecker(ctx);
    return await overviewStatsService(ctx, { brokerId });
  },
});
