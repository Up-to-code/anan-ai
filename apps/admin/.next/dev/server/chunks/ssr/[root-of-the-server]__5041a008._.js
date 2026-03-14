module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/admin/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/admin/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/admin/app/(admin)/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/admin/app/(admin)/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/admin/app/(admin)/users/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/admin/app/(admin)/users/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/admin/server/auth/guards.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertAdminSession",
    ()=>assertAdminSession,
    "requireAdminSession",
    ()=>requireAdminSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/server/auth/session.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$contracts$2f$errors$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/server/contracts/errors.ts [app-rsc] (ecmascript)");
;
;
/**
 * WHY:   Admin server functions need one shared place for role enforcement.
 * WHAT:  Exposes the admin session guard used by routes, server actions, and repositories.
 * HOW:   Reuses the shared session resolver, then validates role and required owner ids.
 */ function requireRoleSession(session, options) {
    const hasRole = options.allowedRoles.includes(session.context.role ?? "");
    const hasOwnerId = !options.requiredOwnerKey || Boolean(session.context[options.requiredOwnerKey]);
    if (!hasRole || !hasOwnerId) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$contracts$2f$errors$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DomainError"]({
            code: "FORBIDDEN",
            message: options.message,
            status: 403
        });
    }
    return session;
}
function assertAdminSession(session) {
    return requireRoleSession(session, {
        allowedRoles: [
            "admin"
        ],
        message: "Admin role required"
    });
}
async function requireAdminSession() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireSessionContext"])();
    return assertAdminSession(session);
}
}),
"[project]/admin/server/infrastructure/convex/adminUsersRepository.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convexAdminUsersRepository",
    ()=>convexAdminUsersRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/convex@1.32.0_react@19.2.3/node_modules/convex/dist/esm/nextjs/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$convexApi$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/admin/lib/convexApi.ts [app-rsc] (ecmascript) <locals>");
;
;
const usersApi = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$convexApi$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["apiUnsafe"]["admin_zone/users"];
const convexAdminUsersRepository = {
    async listAdminUsers (token, input) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(usersApi.listAdminUsers, input, {
            token
        });
    },
    async listAdminProfiles (token, input) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(usersApi.listAdminProfiles, input, {
            token
        });
    },
    async listAdminMemberships (token, input) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(usersApi.listAdminMemberships, input, {
            token
        });
    },
    async listAdminUserVerification (token, input) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(usersApi.listAdminUserVerification, input, {
            token
        });
    },
    async list (token, input) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(usersApi.listUsers, input, {
            token
        });
    },
    async getDetail (token, userKey) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(usersApi.getAdminUserDetail, {
            userKey
        }, {
            token
        });
    },
    async listKnowledgeResearch (token, userId, limit = 20) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(usersApi.getUserKnowledgeResearch, {
            userId,
            limit
        }, {
            token
        });
    },
    async listSearchLogs (token, userId, limit = 50) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(usersApi.getUserSearchLogs, {
            userId,
            limit
        }, {
            token
        });
    },
    async listAgentMemory (token, userId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchQuery"])(usersApi.getUserAgentMemory, {
            userId
        }, {
            token
        });
    },
    async update (token, input) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$convex$40$1$2e$32$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$convex$2f$dist$2f$esm$2f$nextjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchMutation"])(usersApi.updateUser, input, {
            token
        });
    }
};
}),
"[project]/admin/admin_zone/api/users.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAdminUserDetailPageData",
    ()=>getAdminUserDetailPageData,
    "getAdminUsersPageData",
    ()=>getAdminUsersPageData,
    "updateAdminUser",
    ()=>updateAdminUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$auth$2f$guards$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/server/auth/guards.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$serverSession$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/serverSession.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$adminUsersRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/server/infrastructure/convex/adminUsersRepository.ts [app-rsc] (ecmascript)");
;
;
;
async function getAdminUsersPageData(input) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$serverSession$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdminPageSession"])("/users");
    const paginationOpts = {
        numItems: input.numItems ?? 20,
        cursor: input.cursor ?? null
    };
    const tab = input.tab ?? "users";
    const users = tab === "profiles" ? await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$adminUsersRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convexAdminUsersRepository"].listAdminProfiles(session.token, {
        paginationOpts
    }) : tab === "memberships" ? await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$adminUsersRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convexAdminUsersRepository"].listAdminMemberships(session.token, {
        paginationOpts
    }) : tab === "verification" ? await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$adminUsersRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convexAdminUsersRepository"].listAdminUserVerification(session.token, {
        paginationOpts
    }) : await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$adminUsersRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convexAdminUsersRepository"].listAdminUsers(session.token, {
        paginationOpts,
        role: input.role
    });
    return {
        session,
        tab,
        users
    };
}
async function getAdminUserDetailPageData(userKey) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$serverSession$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdminPageSession"])(`/users/${encodeURIComponent(userKey)}`);
    const detail = await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$adminUsersRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convexAdminUsersRepository"].getDetail(session.token, userKey);
    return {
        session,
        detail
    };
}
async function updateAdminUser(input) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$auth$2f$guards$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdminSession"])();
    await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$server$2f$infrastructure$2f$convex$2f$adminUsersRepository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convexAdminUsersRepository"].update(session.token, input);
}
}),
"[project]/admin/components/shared/DataTable.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DataTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/utils.ts [app-rsc] (ecmascript)");
;
;
function DataTable({ headers, children, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("overflow-x-auto border border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm", className),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "min-w-full border-collapse",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        className: "border-b border-slate-200/60 bg-slate-50/50",
                        children: headers.map((header)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-4 py-3 text-right text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                                children: header
                            }, header, false, {
                                fileName: "[project]/admin/components/shared/DataTable.tsx",
                                lineNumber: 22,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/admin/components/shared/DataTable.tsx",
                        lineNumber: 20,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/admin/components/shared/DataTable.tsx",
                    lineNumber: 19,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: children
                }, void 0, false, {
                    fileName: "[project]/admin/components/shared/DataTable.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/admin/components/shared/DataTable.tsx",
            lineNumber: 18,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/components/shared/DataTable.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/admin/components/shared/EmptyState.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EmptyState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/utils.ts [app-rsc] (ecmascript)");
;
;
function EmptyState({ title, description, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm font-black uppercase tracking-widest text-slate-500",
                children: title
            }, void 0, false, {
                fileName: "[project]/admin/components/shared/EmptyState.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-3 text-sm font-semibold leading-relaxed text-slate-600",
                children: description
            }, void 0, false, {
                fileName: "[project]/admin/components/shared/EmptyState.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/shared/EmptyState.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
}),
"[project]/admin/lib/adminLabels.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "labelForChannel",
    ()=>labelForChannel,
    "labelForOwnerType",
    ()=>labelForOwnerType,
    "labelForRole",
    ()=>labelForRole,
    "labelForStatus",
    ()=>labelForStatus,
    "labelForVerificationType",
    ()=>labelForVerificationType
]);
/**
 * WHY:   The Arabic admin console repeats the same domain terms across nav, tables, tabs, and chips.
 * WHAT:  Centralizes Arabic labels for statuses, roles, channels, owner types, and verification request types.
 * HOW:   Exposes small lookup helpers with readable fallbacks so page code stays focused on layout.
 */ const statusLabels = {
    available: "متاح",
    sold: "مباع",
    reserved: "محجوز",
    draft: "مسودة",
    published: "منشور",
    archived: "مؤرشف",
    new: "جديد",
    in_review: "قيد المراجعة",
    approved: "معتمد",
    rejected: "مرفوض",
    pending: "معلق",
    active: "نشط",
    inactive: "غير نشط",
    canceled: "ملغي",
    trial: "تجريبي",
    private: "خاص",
    public: "عام",
    member: "عضو",
    not_member: "غير عضو",
    success: "ناجح",
    failed: "فشل",
    none: "غير متوفر",
    unknown: "غير معروف",
    new_lead: "طلب جديد",
    contacted: "تم التواصل",
    qualified: "مؤهل",
    offer_made: "تم إرسال عرض",
    under_contract: "تحت التعاقد",
    closed_won: "مغلق ناجح",
    closed_lost: "مغلق خاسر"
};
const channelLabels = {
    whatsapp: "واتساب",
    app: "التطبيق",
    web: "الويب"
};
const roleLabels = {
    admin: "مشرف",
    broker: "وسيط",
    developer: "مطور",
    RED: "مطور",
    user: "مستخدم"
};
const ownerTypeLabels = {
    broker: "وسيط",
    red: "مطور",
    RED: "مطور"
};
const verificationTypeLabels = {
    user: "مستخدم",
    broker: "وسيط",
    RED: "مطور"
};
function fallbackLabel(value) {
    if (!value) {
        return "غير متوفر";
    }
    return value.replaceAll("_", " ");
}
function labelForStatus(value) {
    if (!value) {
        return "غير متوفر";
    }
    return statusLabels[value] ?? fallbackLabel(value);
}
function labelForChannel(value) {
    if (!value) {
        return "غير متوفر";
    }
    return channelLabels[value] ?? fallbackLabel(value);
}
function labelForRole(value) {
    if (!value) {
        return "غير متوفر";
    }
    return roleLabels[value] ?? fallbackLabel(value);
}
function labelForOwnerType(value) {
    if (!value) {
        return "غير متوفر";
    }
    return ownerTypeLabels[value] ?? fallbackLabel(value);
}
function labelForVerificationType(value) {
    if (!value) {
        return "غير متوفر";
    }
    return verificationTypeLabels[value] ?? fallbackLabel(value);
}
}),
"[project]/admin/components/shared/StatusBadge.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$adminLabels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/adminLabels.ts [app-rsc] (ecmascript)");
;
;
;
const toneByValue = {
    available: "border-emerald-200 bg-emerald-50 text-emerald-700",
    sold: "border-slate-200 bg-slate-100 text-slate-700",
    reserved: "border-amber-200 bg-amber-50 text-amber-700",
    new_lead: "border-blue-200 bg-blue-50 text-blue-700",
    contacted: "border-sky-200 bg-sky-50 text-sky-700",
    qualified: "border-indigo-200 bg-indigo-50 text-indigo-700",
    offer_made: "border-violet-200 bg-violet-50 text-violet-700",
    under_contract: "border-orange-200 bg-orange-50 text-orange-700",
    closed_won: "border-emerald-200 bg-emerald-50 text-emerald-700",
    closed_lost: "border-rose-200 bg-rose-50 text-rose-700",
    failed: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700"
};
function StatusBadge({ value, className }) {
    const normalized = value?.trim() || "unknown";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("inline-flex border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]", toneByValue[normalized] ?? "border-slate-200 bg-slate-50 text-slate-600", className),
        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$adminLabels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["labelForStatus"])(normalized)
    }, void 0, false, {
        fileName: "[project]/admin/components/shared/StatusBadge.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
}),
"[project]/admin/components/shared/WorkspacePanel.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WorkspacePanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/utils.ts [app-rsc] (ecmascript)");
;
;
const tones = {
    default: "border border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm",
    dark: "border border-slate-800 bg-slate-900 text-white shadow-sm",
    muted: "border border-slate-200/60 bg-slate-50/80 shadow-sm",
    warn: "border border-amber-200 bg-amber-50 shadow-sm"
};
function WorkspacePanel({ children, className, tone = "default" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("p-6", tones[tone], className),
        children: children
    }, void 0, false, {
        fileName: "[project]/admin/components/shared/WorkspacePanel.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/admin/lib/format.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * WHY:   Admin pages repeat the same operational value formatting across metrics, tables, and detail panels.
 * WHAT:  Exposes small formatting helpers for numbers, percentages, currency, and timestamps.
 * HOW:   Uses the browser internationalization APIs with stable defaults for the admin console.
 */ __turbopack_context__.s([
    "formatCurrency",
    ()=>formatCurrency,
    "formatDateTime",
    ()=>formatDateTime,
    "formatNumber",
    ()=>formatNumber,
    "formatPercent",
    ()=>formatPercent
]);
function formatNumber(value) {
    return new Intl.NumberFormat("ar-SA").format(value ?? 0);
}
function formatCurrency(value) {
    return new Intl.NumberFormat("en-SA", {
        style: "currency",
        currency: "SAR",
        maximumFractionDigits: 0
    }).format(value ?? 0);
}
function formatPercent(rate) {
    return new Intl.NumberFormat("ar-SA", {
        style: "percent",
        maximumFractionDigits: 1
    }).format(rate ?? 0);
}
function formatDateTime(value) {
    if (!value) {
        return "غير متوفر";
    }
    return new Intl.DateTimeFormat("ar-SA", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value));
}
}),
"[project]/admin/admin_zone/pages/UsersPage/index.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UsersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$api$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/api/users.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$DataTable$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/shared/DataTable.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$EmptyState$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/shared/EmptyState.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/shared/StatusBadge.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$WorkspacePanel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/shared/WorkspacePanel.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$adminLabels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/adminLabels.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$format$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/format.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
function value(row, key, fallback = "غير متوفر") {
    const field = row[key];
    if (field === undefined || field === null || field === "") {
        return fallback;
    }
    return String(field);
}
async function UsersPage({ tab = "users" }) {
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$api$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAdminUsersPageData"])({
        tab
    });
    const rows = data.users.page;
    if (rows.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$EmptyState$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
            title: "لا توجد بيانات",
            description: "لم يتم العثور على سجلات تطابق هذا القسم حتى الآن."
        }, void 0, false, {
            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
            lineNumber: 34,
            columnNumber: 7
        }, this);
    }
    if (tab === "profiles") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$WorkspacePanel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$DataTable$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                headers: [
                    "الاسم",
                    "البريد",
                    "الدور",
                    "المنظمة",
                    "التحقق",
                    "الحالة"
                ],
                children: rows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        className: "border-b border-slate-100 last:border-b-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 font-black text-slate-900",
                                children: value(row, "name")
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 47,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: value(row, "email")
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 48,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$adminLabels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["labelForRole"])(value(row, "role", ""))
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 49,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: value(row, "organizationName")
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 50,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    value: value(row, "verificationStatus", "none")
                                }, void 0, false, {
                                    fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                    lineNumber: 51,
                                    columnNumber: 41
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 51,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    value: String(row.isActive ? "active" : "inactive")
                                }, void 0, false, {
                                    fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                    lineNumber: 52,
                                    columnNumber: 41
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 52,
                                columnNumber: 15
                            }, this)
                        ]
                    }, value(row, "id"), true, {
                        fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                        lineNumber: 46,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                lineNumber: 44,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
            lineNumber: 43,
            columnNumber: 7
        }, this);
    }
    if (tab === "memberships") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$WorkspacePanel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$DataTable$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                headers: [
                    "المنظمة",
                    "نوع المنظمة",
                    "المستخدم",
                    "الدور",
                    "الحالة",
                    "آخر تحديث"
                ],
                children: rows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        className: "border-b border-slate-100 last:border-b-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 font-black text-slate-900",
                                children: value(row, "organizationName")
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 66,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$adminLabels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["labelForOwnerType"])(value(row, "ownerType"))
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 67,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: [
                                    value(row, "profileName"),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1 text-xs text-slate-500",
                                        children: value(row, "profileEmail")
                                    }, void 0, false, {
                                        fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                        lineNumber: 70,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 68,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: value(row, "role")
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 72,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    value: value(row, "status")
                                }, void 0, false, {
                                    fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                    lineNumber: 73,
                                    columnNumber: 41
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 73,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$format$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatDateTime"])(Number(row.updatedAt ?? 0))
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 74,
                                columnNumber: 15
                            }, this)
                        ]
                    }, value(row, "id"), true, {
                        fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                        lineNumber: 65,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                lineNumber: 63,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
            lineNumber: 62,
            columnNumber: 7
        }, this);
    }
    if (tab === "verification") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$WorkspacePanel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$DataTable$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                headers: [
                    "المستخدم",
                    "البريد",
                    "الدور",
                    "آخر طلب",
                    "تاريخ الإرسال",
                    "الحالة"
                ],
                children: rows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        className: "border-b border-slate-100 last:border-b-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 font-black text-slate-900",
                                children: value(row, "name")
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 88,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: value(row, "email")
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 89,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$adminLabels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["labelForRole"])(value(row, "role"))
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 90,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: value(row, "latestRequestId")
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 91,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3 text-sm font-semibold text-slate-600",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$format$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatDateTime"])(Number(row.latestRequestSubmittedAt ?? 0))
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 92,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                className: "px-4 py-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    value: value(row, "latestRequestStatus", value(row, "roleStatus", "none"))
                                }, void 0, false, {
                                    fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                    lineNumber: 93,
                                    columnNumber: 41
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 93,
                                columnNumber: 15
                            }, this)
                        ]
                    }, value(row, "id"), true, {
                        fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                        lineNumber: 87,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                lineNumber: 85,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
            lineNumber: 84,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$WorkspacePanel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$DataTable$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
            headers: [
                "المستخدم",
                "القناة",
                "الدور",
                "المنظمة",
                "التحقق",
                "التفاصيل"
            ],
            children: rows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                    className: "border-b border-slate-100 last:border-b-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            className: "px-4 py-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-black text-slate-900",
                                    children: value(row, "name")
                                }, void 0, false, {
                                    fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                    lineNumber: 107,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-1 text-xs font-semibold text-slate-500",
                                    children: value(row, "email")
                                }, void 0, false, {
                                    fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                    lineNumber: 108,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                            lineNumber: 106,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            className: "px-4 py-3 text-sm font-semibold text-slate-600",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$adminLabels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["labelForChannel"])(value(row, "channel", ""))
                        }, void 0, false, {
                            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                            lineNumber: 110,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            className: "px-4 py-3 text-sm font-semibold text-slate-600",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$adminLabels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["labelForRole"])(value(row, "role", "user"))
                        }, void 0, false, {
                            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                            lineNumber: 111,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            className: "px-4 py-3 text-sm font-semibold text-slate-600",
                            children: value(row, "organizationName")
                        }, void 0, false, {
                            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                            lineNumber: 112,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            className: "px-4 py-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                value: value(row, "verificationStatus", "none")
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 113,
                                columnNumber: 39
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                            lineNumber: 113,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            className: "px-4 py-3 text-sm font-black text-blue-600",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: `/users/${encodeURIComponent(value(row, "userKey"))}`,
                                children: "فتح الملف"
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                                lineNumber: 115,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                            lineNumber: 114,
                            columnNumber: 13
                        }, this)
                    ]
                }, value(row, "userKey"), true, {
                    fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
                    lineNumber: 105,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
            lineNumber: 103,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/admin_zone/pages/UsersPage/index.tsx",
        lineNumber: 102,
        columnNumber: 5
    }, this);
}
}),
"[project]/admin/app/(admin)/users/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UsersRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$UsersPage$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/pages/UsersPage/index.tsx [app-rsc] (ecmascript)");
;
;
function UsersRoute() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$UsersPage$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/admin/app/(admin)/users/page.tsx",
        lineNumber: 9,
        columnNumber: 10
    }, this);
}
}),
"[project]/admin/app/(admin)/users/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/admin/app/(admin)/users/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5041a008._.js.map