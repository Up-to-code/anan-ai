import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { DealStage } from "../types";
import { useConvexBootstrapState } from "@/_core/hooks/useConvexBootstrapState";

export function useCrmBoard() {
  const { shouldRunProtectedQueries } = useConvexBootstrapState();
  const deals = useQuery(
    api.shared_logic.crm.index.getDealsSafe,
    shouldRunProtectedQueries ? {} : "skip",
  );
  const createDeal = useMutation(api.shared_logic.crm.index.createDeal);
  const updateDealStage = useMutation(api.shared_logic.crm.index.updateDealStage);
  const updateDealNotes = useMutation(api.shared_logic.crm.index.updateDealNotes);

  return useMemo(
    () => ({
      deals: deals ?? [],
      isLoading: shouldRunProtectedQueries && deals === undefined,
      createDeal,
      updateDealStage: (dealId: string, stage: DealStage) =>
        updateDealStage({ dealId: dealId as never, stage }),
      updateDealNotes: (dealId: string, notes: string) =>
        updateDealNotes({ dealId: dealId as never, notes }),
    }),
    [deals, createDeal, updateDealStage, updateDealNotes, shouldRunProtectedQueries],
  );
}
