import { ConvexError } from "convex/values";
import type { Doc } from "../../../_generated/dataModel";
import type { CreateOfferCaseArgs, LegacyOfferStatus, LegacyPublicationState, LegacyOfferVisibility, OfferCaseStage, OfferCaseType, OfferPackageVisibility, StoredOfferPackageVisibility } from "./types";
import {
  isClosedStage as sharedIsClosedStage,
  isOpenlyVisible as sharedIsOpenlyVisible,
  isPresent as sharedIsPresent,
  legacyPublicationStateFromStage as sharedLegacyPublicationStateFromStage,
  legacyStatusFromStage as sharedLegacyStatusFromStage,
  legacyVisibilityFromPackage as sharedLegacyVisibilityFromPackage,
  resolveCaseType as sharedResolveCaseType,
  resolveStageForDraft as sharedResolveStageForDraft,
  resolveStageForPublish as sharedResolveStageForPublish,
  resolveVisibility as sharedResolveVisibility,
} from "../../../../packages/offers-logic/src/cases";

export function assert(condition: unknown, message: string, code = "INVALID_STATE"): asserts condition {
  if (!condition) {
    throw new ConvexError({ code, message });
  }
}

export function legacyStatusFromStage(stage: OfferCaseStage): LegacyOfferStatus {
  return sharedLegacyStatusFromStage(stage);
}

export function legacyPublicationStateFromStage(stage: OfferCaseStage): LegacyPublicationState {
  return sharedLegacyPublicationStateFromStage(stage);
}

export function legacyVisibilityFromPackage(visibility: StoredOfferPackageVisibility): LegacyOfferVisibility {
  return sharedLegacyVisibilityFromPackage(visibility);
}

export function isClosedStage(stage: OfferCaseStage) {
  return sharedIsClosedStage(stage);
}

export function resolveVisibility(args: CreateOfferCaseArgs): OfferPackageVisibility {
  return sharedResolveVisibility(args);
}

export function resolveCaseType(args: CreateOfferCaseArgs): OfferCaseType {
  return sharedResolveCaseType(args);
}

export function resolveStageForDraft() {
  return sharedResolveStageForDraft();
}

export function resolveStageForPublish(type: OfferCaseType): OfferCaseStage {
  return sharedResolveStageForPublish(type);
}

export function isPresent<T>(value: T | null | undefined): value is T {
  return sharedIsPresent(value);
}

export function isOpenlyVisible(offerCase: Doc<"offerCases">, offerPackage: Doc<"offerPackages">) {
  return sharedIsOpenlyVisible(offerCase, offerPackage);
}
