import { adminSignupRepository } from "@/server/infrastructure/convex/adminSignupRepository";

export function validateAdminSignupInvite(input: {
  email: string;
  token?: string;
  bootstrapSecret?: string;
}) {
  return adminSignupRepository.validate(input);
}

export function completeAdminSignup(input: {
  email: string;
  name: string;
  authUserId: string;
  token?: string;
  bootstrapSecret?: string;
}) {
  return adminSignupRepository.complete(input);
}
