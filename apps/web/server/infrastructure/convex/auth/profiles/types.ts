import type { ProfileSummary, UpdateProfileInput } from "@/server/contracts/profiles";

/**
 * WHY: Profile resolution must be swappable as the migration moves more logic out of Convex.
 * WHAT: Defines the stable profile reads and writes used by the web server layer.
 * HOW: Implementations hide transport details and return ProfileSummary DTOs.
 */
export type ProfilesRepository = {
  getCurrent(token: string): Promise<ProfileSummary | null>;
  updateCurrent(token: string, input: UpdateProfileInput): Promise<ProfileSummary>;
};
