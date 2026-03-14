import { fetchQuery } from "convex/nextjs";
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

const developersApi = apiUnsafe["admin_zone/developers"] as DevelopersApiRefs;
const chartsApi = apiUnsafe["admin_zone/charts"] as ChartsApiRefs;

export type AdminDevLog = Record<string, unknown>;

/**
 * WHY:   Diagnostics needs one repository surface that groups operational health readers.
 * WHAT:  Exposes auth-scoped reads for failure logs, rates, and chart series.
 * HOW:   Delegates to the existing developer and chart queries in `convex/admin_zone`.
 */
export const convexAdminDiagnosticsRepository = {
  async listDevLogs(token: string, limit = 50) {
    return fetchQuery(developersApi.devLogs as never, { limit } as never, { token }) as Promise<AdminDevLog[]>;
  },
  async getErrorRate(token: string, range: "day" | "week" | "month" = "week") {
    return fetchQuery(developersApi.devErrorRate as never, { range } as never, { token }) as Promise<{
      total: number;
      errors: number;
      rate: number;
    }>;
  },
  async getSearchActivityChart(token: string, range: "day" | "week" | "month" = "week") {
    return fetchQuery(chartsApi.searchActivityChart as never, { range } as never, { token }) as Promise<{
      labels: string[];
      successSeries: number[];
      failedSeries: number[];
    }>;
  },
  async getErrorHealthChart(token: string, range: "day" | "week" | "month" = "week") {
    return fetchQuery(chartsApi.errorHealthChart as never, { range } as never, { token }) as Promise<{
      labels: string[];
      errorByStatus: Record<string, number>;
      errorByStage: Record<string, number>;
    }>;
  },
  async getChannelDistribution(token: string) {
    return fetchQuery(chartsApi.channelDistribution as never, {} as never, { token }) as Promise<{
      whatsapp: number;
      app: number;
      web: number;
    }>;
  },
};
