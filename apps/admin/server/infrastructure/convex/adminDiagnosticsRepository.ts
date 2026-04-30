import { createRepositoryRefs, queryRef } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

type DevelopersApiRefs = {
  devLogs: unknown;
  devErrorRate: unknown;
};

type ChartsApiRefs = {
  searchActivityChart: unknown;
  errorHealthChart: unknown;
  channelDistribution: unknown;
};

const developersApi = createRepositoryRefs<DevelopersApiRefs>(apiUnsafe, "admin_zone/developers");
const chartsApi = createRepositoryRefs<ChartsApiRefs>(apiUnsafe, "admin_zone/charts");

export type AdminDevLog = Record<string, unknown>;

/**
 * WHY:   Diagnostics needs one repository surface that groups operational health readers.
 * WHAT:  Exposes auth-scoped reads for failure logs, rates, and chart series.
 * HOW:   Delegates to the existing developer and chart queries in `convex/admin_zone`.
 */
export const convexAdminDiagnosticsRepository = {
  async listDevLogs(token: string, limit = 50) {
    return queryRef<AdminDevLog[]>(token, developersApi.devLogs, { limit });
  },
  async getErrorRate(token: string, range: "day" | "week" | "month" = "week") {
    return queryRef<{
      total: number;
      errors: number;
      rate: number;
    }>(token, developersApi.devErrorRate, { range });
  },
  async getSearchActivityChart(token: string, range: "day" | "week" | "month" = "week") {
    return queryRef<{
      labels: string[];
      successSeries: number[];
      failedSeries: number[];
    }>(token, chartsApi.searchActivityChart, { range });
  },
  async getErrorHealthChart(token: string, range: "day" | "week" | "month" = "week") {
    return queryRef<{
      labels: string[];
      errorByStatus: Record<string, number>;
      errorByStage: Record<string, number>;
    }>(token, chartsApi.errorHealthChart, { range });
  },
  async getChannelDistribution(token: string) {
    return queryRef<{
      workspace: number;
      web: number;
      admin: number;
    }>(token, chartsApi.channelDistribution);
  },
};
