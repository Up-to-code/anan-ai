module.exports = [
"[project]/admin/server/contracts/errors.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * WHY:   The Next.js gateway must return stable application errors instead of leaking raw Convex failures.
 * WHAT:  Defines the normalized domain error shape plus helpers to coerce unknown failures into HTTP responses.
 * HOW:   Parses known Convex error payloads, maps codes to HTTP status codes, and serializes JSON responses.
 */ __turbopack_context__.s([
    "DomainError",
    ()=>DomainError,
    "normalizeDomainError",
    ()=>normalizeDomainError,
    "toErrorResponse",
    ()=>toErrorResponse
]);
const DOMAIN_STATUS_BY_CODE = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    ACCOUNT_INACTIVE: 403,
    ROLE_PENDING: 403,
    ROLE_REJECTED: 403,
    VERIFICATION_REQUIRED: 403,
    NOT_FOUND: 404,
    ORGANIZATION_EXISTS: 409,
    INVITE_EXISTS: 409,
    MEMBER_EXISTS: 409,
    USERNAME_TAKEN: 409,
    INVALID_ARGUMENT: 400,
    INVALID_REQUEST: 400,
    INVALID_CLIENT: 400,
    INVALID_GRANT: 400,
    INVALID_REDIRECT_URI: 400,
    INVALID_SCOPE: 400,
    INVITE_EXPIRED: 410
};
class DomainError extends Error {
    code;
    status;
    constructor(shape){
        super(shape.message);
        this.name = "DomainError";
        this.code = shape.code;
        this.status = shape.status;
    }
}
function parseConvexErrorPayload(error) {
    const data = error?.data;
    if (data && typeof data === "object") {
        return data;
    }
    const message = error instanceof Error ? error.message : typeof error === "string" ? error : null;
    if (!message) return null;
    const jsonStart = message.indexOf("{");
    const jsonEnd = message.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return null;
    try {
        return JSON.parse(message.slice(jsonStart, jsonEnd + 1));
    } catch  {
        return null;
    }
}
function normalizeDomainError(error) {
    if (error instanceof DomainError) {
        return error;
    }
    const convexPayload = parseConvexErrorPayload(error);
    if (convexPayload?.code && convexPayload?.message) {
        return new DomainError({
            code: convexPayload.code,
            message: convexPayload.message,
            status: DOMAIN_STATUS_BY_CODE[convexPayload.code] ?? 500
        });
    }
    if (error instanceof Error) {
        return new DomainError({
            code: "INTERNAL_ERROR",
            message: error.message || "Unexpected server error",
            status: 500
        });
    }
    return new DomainError({
        code: "INTERNAL_ERROR",
        message: "Unexpected server error",
        status: 500
    });
}
function toErrorResponse(error) {
    const domainError = normalizeDomainError(error);
    return Response.json({
        code: domainError.code,
        message: domainError.message,
        status: domainError.status
    }, {
        status: domainError.status
    });
}
}),
"[project]/convex/_generated/api.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "components",
    ()=>components,
    "internal",
    ()=>internal
]);
/* eslint-disable */ /**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/convex@1.32.0_react@19.2.4/node_modules/convex/dist/esm/server/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$api$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/convex@1.32.0_react@19.2.4/node_modules/convex/dist/esm/server/api.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$components$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/convex@1.32.0_react@19.2.4/node_modules/convex/dist/esm/server/components/index.js [app-rsc] (ecmascript) <locals>");
;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$api$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["anyApi"];
const internal = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$api$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["anyApi"];
const components = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$components$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["componentsGeneric"])();
}),
"[project]/admin/lib/convexApi.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiUnsafe",
    ()=>apiUnsafe,
    "internalUnsafe",
    ()=>internalUnsafe
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/convex/_generated/api.js [app-rsc] (ecmascript)");
;
;
const apiUnsafe = __TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"];
const internalUnsafe = __TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["internal"];
}),
"[project]/admin/server/infrastructure/convex/profilesRepository.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convexProfilesRepository",
    ()=>convexProfilesRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/convex@1.32.0_react@19.2.3/node_modules/convex/dist/esm/nextjs/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$convexApi$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/admin/lib/convexApi.ts [app-rsc] (ecmascript) <locals>");
;
;
;
const usersApi = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$convexApi$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["apiUnsafe"]["shared_logic/users/index"];
const convexProfilesRepository = {
    async getCurrent (token) {
        const profile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(usersApi.getMyProfile, {}, {
            token
        });
        return profile;
    },
    async updateCurrent (token, input) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchMutation"])(usersApi.updateMyProfile, input, {
            token
        });
    }
};
}),
"[project]/admin/server/infrastructure/convex/sessionRepository.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convexSessionsRepository",
    ()=>convexSessionsRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/convex@1.32.0_react@19.2.3/node_modules/convex/dist/esm/nextjs/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$convexApi$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/admin/lib/convexApi.ts [app-rsc] (ecmascript) <locals>");
;
;
const sessionApi = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$convexApi$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["apiUnsafe"]["shared_logic/users/session"];
const convexSessionsRepository = {
    async getCurrent (token) {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(sessionApi.getSessionUser, {}, {
            token
        });
        return user;
    }
};
}),
"[project]/admin/server/auth/session.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getOptionalSessionContext",
    ()=>getOptionalSessionContext,
    "requireSessionContext",
    ()=>requireSessionContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$convex$2d$dev$2b$auth$40$0$2e$0$2e$91_$40$auth$2b$core$40$0$2e$37$2e$4_convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f40$convex$2d$dev$2f$auth$2f$dist$2f$nextjs$2f$server$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@convex-dev+auth@0.0.91_@auth+core@0.37.4_convex@1.32.0_react@19.2.3__react@19.2.3/node_modules/@convex-dev/auth/dist/nextjs/server/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$contracts$2f$errors$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/server/contracts/errors.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$profilesRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/server/infrastructure/convex/profilesRepository.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$sessionRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/server/infrastructure/convex/sessionRepository.ts [app-rsc] (ecmascript)");
;
;
;
;
const defaultDependencies = {
    getToken: async ()=>await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$convex$2d$dev$2b$auth$40$0$2e$0$2e$91_$40$auth$2b$core$40$0$2e$37$2e$4_convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f40$convex$2d$dev$2f$auth$2f$dist$2f$nextjs$2f$server$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["convexAuthNextjsToken"])() ?? null,
    sessionsRepository: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$sessionRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convexSessionsRepository"],
    profilesRepository: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$profilesRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convexProfilesRepository"]
};
async function getOptionalSessionContext(dependencies = defaultDependencies) {
    const token = await dependencies.getToken();
    if (!token) {
        return null;
    }
    const [user, profile] = await Promise.all([
        dependencies.sessionsRepository.getCurrent(token),
        dependencies.profilesRepository.getCurrent(token)
    ]);
    if (!user || user.isActive === false) {
        return null;
    }
    return {
        token,
        profile,
        context: {
            userId: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            username: profile?.username,
            role: profile?.role,
            brokerId: profile?.brokerId,
            redId: profile?.REDId,
            isActive: user.isActive
        }
    };
}
async function requireSessionContext(dependencies = defaultDependencies) {
    const session = await getOptionalSessionContext(dependencies);
    if (!session) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$contracts$2f$errors$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DomainError"]({
            code: "UNAUTHORIZED",
            message: "Authentication required",
            status: 401
        });
    }
    return session;
}
}),
"[project]/admin/server/contracts/session.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * WHY:   The web gateway needs one stable authenticated-user shape across pages, services, and API routes.
 * WHAT:  SessionContext carries the current user's identity, active state, and resolved organization role links.
 * HOW:   It is assembled in the auth layer from the Convex auth session plus the current profile record.
 */ __turbopack_context__.s([
    "toSessionUser",
    ()=>toSessionUser
]);
function toSessionUser(context) {
    return {
        id: context.userId,
        name: context.name,
        email: context.email,
        image: context.image,
        username: context.username,
        isActive: context.isActive
    };
}
}),
"[project]/admin/lib/serverSession.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAuthenticatedSession",
    ()=>getAuthenticatedSession,
    "requireAdminPageSession",
    ()=>requireAdminPageSession,
    "sanitizeInternalReturnTo",
    ()=>sanitizeInternalReturnTo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/server/auth/session.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$contracts$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/server/contracts/session.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
;
;
;
async function getAuthenticatedSession() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOptionalSessionContext"])();
    if (!session) {
        return {
            token: null,
            user: null,
            role: null
        };
    }
    return {
        token: session.token,
        user: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$contracts$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toSessionUser"])(session.context),
        role: session.context.role ?? null
    };
}
async function requireAdminPageSession(returnTo = "/dashboard") {
    const session = await getAuthenticatedSession();
    if (!session.token || !session.user || session.role !== "admin") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
    }
    return session;
}
function sanitizeInternalReturnTo(returnTo, fallback = "/dashboard") {
    if (!returnTo) {
        return fallback;
    }
    if (!returnTo.startsWith("/") || returnTo.startsWith("//")) {
        return fallback;
    }
    if (returnTo.startsWith("/signin")) {
        return fallback;
    }
    return returnTo;
}
}),
"[project]/admin/app/(docs)/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DocsRootLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$serverSession$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/serverSession.ts [app-rsc] (ecmascript)");
;
;
;
async function DocsRootLayout({ children }) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$serverSession$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAuthenticatedSession"])();
    if (!session.token || !session.user) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/signin?returnTo=/docs");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-svh bg-slate-50 text-slate-950",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-slate-200 bg-white/90 backdrop-blur-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-4 lg:px-10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[11px] font-black uppercase tracking-[0.3em] text-blue-600",
                                    children: "Developer Docs"
                                }, void 0, false, {
                                    fileName: "[project]/admin/app/(docs)/layout.tsx",
                                    lineNumber: 25,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xl font-black tracking-tight text-slate-950",
                                    children: "Anan Internal Handbook"
                                }, void 0, false, {
                                    fileName: "[project]/admin/app/(docs)/layout.tsx",
                                    lineNumber: 26,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/app/(docs)/layout.tsx",
                            lineNumber: 24,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-right",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                                    children: "Signed In"
                                }, void 0, false, {
                                    fileName: "[project]/admin/app/(docs)/layout.tsx",
                                    lineNumber: 29,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-1 text-sm font-semibold text-slate-700",
                                    children: session.user.name || session.user.email || session.user.id
                                }, void 0, false, {
                                    fileName: "[project]/admin/app/(docs)/layout.tsx",
                                    lineNumber: 30,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/app/(docs)/layout.tsx",
                            lineNumber: 28,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/app/(docs)/layout.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/app/(docs)/layout.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "mx-auto max-w-[1440px] px-6 py-6 lg:px-10 lg:py-8",
                children: children
            }, void 0, false, {
                fileName: "[project]/admin/app/(docs)/layout.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/app/(docs)/layout.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_f5c69d03._.js.map