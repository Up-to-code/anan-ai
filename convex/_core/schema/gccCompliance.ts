import { v } from "convex/values";

export const gccPermitVerificationStatusValidator = v.union(
  v.literal("missing"),
  v.literal("submitted"),
  v.literal("in_review"),
  v.literal("verified"),
  v.literal("rejected"),
  v.literal("expired"),
);

export const gccPermitTypeValidator = v.union(
  v.literal("rega_ad_license"),
  v.literal("fal_platform_license"),
  v.literal("trakheesi"),
  v.literal("madmoun"),
  v.literal("adgm_advertising_permit"),
  v.literal("bahrain_rera_advertising_guideline"),
  v.literal("qatar_broker_license"),
  v.literal("generic_ad_permit"),
);

export const gccSourceAuthorityValidator = v.union(
  v.literal("REGA"),
  v.literal("DLD_RERA"),
  v.literal("ADREC"),
  v.literal("ADGM"),
  v.literal("BAHRAIN_RERA"),
  v.literal("QATAR_MOJ"),
  v.literal("OTHER"),
);

