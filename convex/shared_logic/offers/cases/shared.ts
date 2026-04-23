import { ConvexError } from "convex/values";
import type { Doc } from "../../../_generated/dataModel";
import type { CreateOfferCaseArgs, LegacyOfferStatus, LegacyPublicationState, LegacyOfferVisibility, OfferCaseStage, OfferCaseType, OfferPackageVisibility, StoredOfferPackageVisibility } from "./types";

export function assert(condition: unknown, message: string, code = "INVALID_STATE"): asserts condition {
  if (!condition) {
    throw new ConvexError({ code, message });
  }
}

export function legacyStatusFromStage(stage: OfferCaseStage): LegacyOfferStatus {
  if (stage === "closed_lost" || stage === "archived") return "rejected";
  if (stage === "engaged" || stage === "agreed" || stage === "closed_won") return "accepted";
  return "pending";
}

export function legacyPublicationStateFromStage(stage: OfferCaseStage): LegacyPublicationState {
  if (stage === "draft") return "draft";
  if (stage === "archived") return "archived";
  return "published";
}

export function legacyVisibilityFromPackage(visibility: StoredOfferPackageVisibility): LegacyOfferVisibility {
  return visibility === "open" || visibility === "public" ? "public" : "private";
}

export function isClosedStage(stage: OfferCaseStage) {
  return stage === "closed_won" || stage === "closed_lost" || stage === "archived";
}

export function resolveVisibility(args: CreateOfferCaseArgs): OfferPackageVisibility {
  if (args.caseType === "open_offer") return "open";
  if (args.visibility === "public") return "open";
  return "private";
}

export function resolveCaseType(args: CreateOfferCaseArgs): OfferCaseType {
  if (args.caseType) return args.caseType;
  if (args.visibility === "public") return "open_offer";
  return args.clientContext ? "collaboration_case" : "private_offer";
}

export function resolveStageForDraft() {
  return "draft" as const;
}

export function resolveStageForPublish(type: OfferCaseType): OfferCaseStage {
  return type === "open_offer" ? "open" : "targeted";
}

export function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function isOpenlyVisible(offerCase: Doc<"offerCases">, offerPackage: Doc<"offerPackages">) {
  return offerCase.stage === "open" && (offerPackage.visibility === "open" || offerPackage.visibility === "public");
}
