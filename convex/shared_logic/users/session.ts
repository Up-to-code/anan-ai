import { query } from "../../_generated/server";
import {
    findProfileForResolvedIdentity,
    requireResolvedIdentity,
} from "../../_core/security/identity";

export const getSessionUser = query({
    args: {},
    handler: async (ctx) => {
        let resolved;
        try {
            resolved = await requireResolvedIdentity(ctx);
        } catch {
            return null;
        }

        const profile = await findProfileForResolvedIdentity(ctx, resolved);
        const activeFlag = (profile as { isActive?: boolean } | null)?.isActive;
        if (activeFlag === false) {
            return null;
        }

        // Match the current frontend session user shape until the frontend auth client migrates.
        return {
            id: resolved.authUserId,
            name: resolved.name,
            email: resolved.email,
            image: resolved.identity.pictureUrl,
            isActive: true,
            // role-based authorization is enforced server-side in accessPolicy
        };
    },
});
