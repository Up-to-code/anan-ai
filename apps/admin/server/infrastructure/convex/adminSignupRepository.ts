import { publicMutationRef } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

const adminSignupApi = apiUnsafe["admin_zone/adminSignup"] as {
  validateAdminSignup: unknown;
  completeAdminSignup: unknown;
};

export const adminSignupRepository = {
  validate(input: {
    email: string;
    token?: string;
    bootstrapSecret?: string;
  }) {
    return publicMutationRef<{ name?: string }>(adminSignupApi.validateAdminSignup, input);
  },
  complete(input: {
    email: string;
    name: string;
    authUserId: string;
    token?: string;
    bootstrapSecret?: string;
  }) {
    return publicMutationRef(adminSignupApi.completeAdminSignup, input);
  },
};
