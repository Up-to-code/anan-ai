module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/admin/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/admin/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/admin/app/(docs)/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/admin/app/(docs)/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/admin/app/(docs)/docs/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/admin/app/(docs)/docs/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DocsSectionPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
const calloutTones = {
    info: "border-sky-200 bg-sky-50 text-slate-800",
    warn: "border-amber-200 bg-amber-50 text-slate-800",
    success: "border-emerald-200 bg-emerald-50 text-slate-800"
};
function DocsSectionPanel({ section, sectionId }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: sectionId,
        className: "scroll-mt-24 space-y-5 border-t border-slate-200/70 pt-10 first:border-t-0 first:pt-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-2xl font-black tracking-tight text-slate-950",
                    children: section.title
                }, void 0, false, {
                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            section.paragraphs?.map((paragraph)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm font-semibold leading-7 text-slate-700",
                    children: paragraph
                }, paragraph, false, {
                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this)),
            section.bullets?.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "space-y-3",
                children: section.bullets.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "border-s border-slate-200 bg-slate-50/70 ps-4 pe-4 py-3 text-sm font-semibold leading-7 text-slate-700",
                        children: item
                    }, item, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                        lineNumber: 35,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this) : null,
            section.callout ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `border p-5 ${calloutTones[section.callout.tone ?? "info"]}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs font-black uppercase tracking-[0.22em] text-slate-600",
                                children: section.callout.title
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                lineNumber: 48,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                                children: "Callout"
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                lineNumber: 49,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 text-sm font-semibold leading-7 text-slate-700",
                        children: section.callout.body
                    }, void 0, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                lineNumber: 46,
                columnNumber: 9
            }, this) : null,
            section.table ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-hidden border border-slate-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-x-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "min-w-full border-collapse",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                className: "bg-slate-950 text-left text-white",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: section.table.headers.map((header)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3 text-xs font-black uppercase tracking-[0.18em]",
                                            children: header
                                        }, header, false, {
                                            fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                            lineNumber: 62,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                    lineNumber: 60,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                lineNumber: 59,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                className: "bg-white",
                                children: section.table.rows.map((row, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-t border-slate-200",
                                        children: row.map((cell, cellIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-4 align-top text-sm font-semibold leading-6 text-slate-700",
                                                children: cell
                                            }, `${cell}-${cellIndex}`, false, {
                                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                                lineNumber: 72,
                                                columnNumber: 23
                                            }, this))
                                    }, `${row.join("-")}-${index}`, false, {
                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                        lineNumber: 70,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                lineNumber: 68,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                        lineNumber: 58,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                    lineNumber: 57,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                lineNumber: 56,
                columnNumber: 9
            }, this) : null,
            section.codeBlock ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                        children: section.codeBlock.label
                    }, void 0, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                        lineNumber: 86,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        className: "overflow-x-auto border border-slate-200 bg-slate-950 p-4 text-xs font-semibold leading-6 text-slate-100",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            children: section.codeBlock.code
                        }, void 0, false, {
                            fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                            lineNumber: 88,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                        lineNumber: 87,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                lineNumber: 85,
                columnNumber: 9
            }, this) : null,
            section.links?.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-3 md:grid-cols-2",
                children: section.links.map((link)=>{
                    const isInternal = link.href.startsWith("/");
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: link.href,
                                    className: "text-sm font-black tracking-tight text-slate-950",
                                    children: link.label
                                }, void 0, false, {
                                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                    lineNumber: 101,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-semibold leading-6 text-slate-600",
                                    children: link.description
                                }, void 0, false, {
                                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                    lineNumber: 104,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[11px] font-black uppercase tracking-[0.18em] text-slate-400",
                                    children: isInternal ? "Internal route" : "External reference"
                                }, void 0, false, {
                                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                                    lineNumber: 105,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                            lineNumber: 100,
                            columnNumber: 17
                        }, this)
                    }, `${link.href}-${link.label}`, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                        lineNumber: 99,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                lineNumber: 94,
                columnNumber: 9
            }, this) : null,
            section.note ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-700",
                children: section.note
            }, void 0, false, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
                lineNumber: 115,
                columnNumber: 23
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
}),
"[project]/admin/admin_zone/pages/DocsPage/registry.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "docsPageMeta",
    ()=>docsPageMeta,
    "docsPageOrder",
    ()=>docsPageOrder,
    "docsPages",
    ()=>docsPages,
    "getDocsPage",
    ()=>getDocsPage,
    "getDocsPageSiblings",
    ()=>getDocsPageSiblings,
    "getDocsSectionId",
    ()=>getDocsSectionId
]);
const docsPageOrder = [
    "overview",
    "architecture",
    "capabilities",
    "ui",
    "data",
    "aiChatflow",
    "workflow"
];
const docsPageMeta = {
    overview: {
        href: "/docs",
        label: "Overview",
        description: "Entry page, reading order, and what the handbook covers."
    },
    architecture: {
        href: "/docs/architecture",
        label: "Architecture",
        description: "Surfaces, zones, request flow, and role model."
    },
    capabilities: {
        href: "/docs/capabilities",
        label: "Capabilities",
        description: "Admin structure plus shared product capabilities and ownership."
    },
    ui: {
        href: "/docs/ui",
        label: "UI Components",
        description: "Real reusable admin and workspace UI surfaces developers can access."
    },
    data: {
        href: "/docs/data",
        label: "Data & Contracts",
        description: "Core entities, ownership fields, state fields, and contract boundaries."
    },
    aiChatflow: {
        href: "/docs/ai-chatflow",
        label: "AI Chatflow",
        description: "Workspace assistant, channels, mobile AI, persistence, and admin touchpoints."
    },
    workflow: {
        href: "/docs/workflow",
        label: "Workflow",
        description: "Where to add code, common commands, and testing expectations."
    }
};
const docsPages = {
    overview: {
        key: "overview",
        eyebrow: "Docs overview",
        title: "Admin Internal Developer Handbook",
        summary: "Use this section to understand the full Anan platform from inside the admin app.",
        intro: [
            "This section turns the internal handbook into real admin pages instead of standalone markdown files.",
            "The docs are written in English for internal developers, while the surrounding admin shell stays consistent with the rest of the console."
        ],
        sections: [
            {
                title: "What this handbook covers",
                bullets: [
                    "The four runtime surfaces: web, admin, mobile, and Convex.",
                    "Zone ownership, request flow, and the current role model.",
                    "Shared capabilities such as inbox, offers, market, properties, subscriptions, knowledge, and agencies.",
                    "Real reusable UI surfaces developers can access today.",
                    "AI and chatflow across workspace, WhatsApp, mobile, persistence, and admin monitoring."
                ]
            },
            {
                title: "Recommended reading order",
                links: docsPageOrder.slice(1).map((key)=>docsPageMeta[key])
            },
            {
                title: "System map",
                codeBlock: {
                    label: "High-level flow",
                    code: [
                        "web / admin / mobile / channel adapters",
                        "           -> web/server or direct Convex entrypoints",
                        "           -> convex/_core + convex/shared_logic + zone modules",
                        "           -> schema tables, assistant threads, inbox, offers, knowledge, orders"
                    ].join("\n")
                }
            },
            {
                title: "Canonical reference files",
                paragraphs: [
                    "The admin handbook is the primary in-app documentation surface. When you need the longer repo-wide references, use the root docs in the workspace rather than expecting them to be route-backed inside admin."
                ],
                codeBlock: {
                    label: "Root repo references",
                    code: [
                        "docs/codebase-knowledge-base.md",
                        "docs/logic-audit-2026-03-13.md",
                        "docs/developer-system-guide.md",
                        "docs/llm-data-access-guide.md"
                    ].join("\n")
                }
            }
        ],
        related: [
            "architecture",
            "capabilities",
            "workflow"
        ]
    },
    architecture: {
        key: "architecture",
        eyebrow: "System map",
        title: "Platform Architecture",
        summary: "Understand how the admin app fits into the wider platform and how requests move across layers.",
        intro: [
            "Anan is implemented as a multi-surface platform rather than a single frontend with a single API.",
            "The admin app is an operational entrypoint into the system, but the owned business logic is distributed across the web server layer and Convex zones."
        ],
        sections: [
            {
                title: "Top-level surfaces",
                table: {
                    headers: [
                        "Surface",
                        "Primary role",
                        "Main ownership"
                    ],
                    rows: [
                        [
                            "web",
                            "Workspace + public site",
                            "Next.js UI plus web/server gateway"
                        ],
                        [
                            "admin",
                            "Operations console",
                            "Admin pages, loaders, and Convex admin read models"
                        ],
                        [
                            "mobile",
                            "Buyer feed app",
                            "Expo UI plus mobile Convex endpoints"
                        ],
                        [
                            "convex",
                            "Backend runtime",
                            "Schema, auth, shared logic, AI orchestration, zone endpoints"
                        ]
                    ]
                }
            },
            {
                title: "Backend zones",
                bullets: [
                    "`convex/_core` owns schema, auth, identity normalization, and access policy.",
                    "`convex/shared_logic` owns shared capabilities such as inbox, offers, properties, market, subscriptions, knowledge, and notifications.",
                    "`convex/ai_zone` owns assistant endpoints, orchestration, agents, and channel adapters.",
                    "`convex/user_zone` owns user-facing backend features, including mobile feed and mobile assistant endpoints.",
                    "`convex/broker_zone` and `convex/red_zone` own owner-scoped low-level backend surfaces.",
                    "`convex/admin_zone` owns admin-specific read models and operations."
                ]
            },
            {
                title: "Request flow",
                codeBlock: {
                    label: "Typical request path",
                    code: [
                        "web/app or admin/app route",
                        "  -> page/module orchestrator",
                        "  -> web/server or admin loader",
                        "  -> Convex entrypoint or repository adapter",
                        "  -> shared logic / zone service",
                        "  -> schema tables"
                    ].join("\n")
                }
            },
            {
                title: "Role model and naming",
                paragraphs: [
                    "The repo currently uses both `developer` and `RED` terminology. Storage still uses the `RED` table and `REDId`, while many access-policy and contract surfaces normalize that to `developer` or `redId`.",
                    "When changing code, keep storage naming aligned with schema and normalize only at the surface that already expects it."
                ],
                callout: {
                    title: "Current-state rule",
                    body: "Do not invent a third naming convention. Follow schema naming at storage boundaries and current surface naming at contract boundaries.",
                    tone: "warn"
                }
            }
        ],
        related: [
            "capabilities",
            "data",
            "workflow"
        ]
    },
    capabilities: {
        key: "capabilities",
        eyebrow: "Capability ownership",
        title: "Codebase Capabilities",
        summary: "Know which folders own which business responsibilities before adding new code.",
        intro: [
            "The admin app is organized around thin routes, page orchestrators, and Convex-backed read models.",
            "Most business logic belongs in shared capabilities or server-side orchestration layers rather than directly in route files."
        ],
        sections: [
            {
                title: "Admin app structure",
                bullets: [
                    "`admin/app/*` contains thin App Router entrypoints and layouts.",
                    "`admin/admin_zone/api/*` contains admin-facing data loaders and write actions.",
                    "`admin/admin_zone/pages/*` contains page orchestrators and page-local structure.",
                    "`admin/components/shared/*` contains reusable admin UI primitives.",
                    "`admin/lib/*` contains labels, navigation, formatting, and local support helpers."
                ]
            },
            {
                title: "Shared product capabilities",
                table: {
                    headers: [
                        "Capability",
                        "Main path",
                        "What it owns"
                    ],
                    rows: [
                        [
                            "Inbox",
                            "convex/shared_logic/inbox.ts",
                            "Conversations, participants, unread counts, offer-linked message bootstrap"
                        ],
                        [
                            "Offers",
                            "convex/shared_logic/offers/*",
                            "Sender rules, recipient discovery, projections, transitions, side effects"
                        ],
                        [
                            "Properties",
                            "convex/shared_logic/properties/*",
                            "Search helpers and property-domain backend helpers"
                        ],
                        [
                            "Market",
                            "convex/shared_logic/market/*",
                            "Market snapshot aggregation and geography normalization"
                        ],
                        [
                            "Agencies",
                            "convex/shared_logic/agencies/*",
                            "Organizations, memberships, invites, and directory projections"
                        ],
                        [
                            "Knowledge",
                            "convex/shared_logic/knowledge/*",
                            "Knowledge pages, assistant threads/messages, memory-related tables"
                        ]
                    ]
                }
            },
            {
                title: "Where logic should live",
                bullets: [
                    "Use `web/server/*` for web-specific orchestration and stable DTO boundaries.",
                    "Use `admin/admin_zone/api/*` for admin-specific loading and server actions.",
                    "Use `convex/shared_logic/*` for shared business rules across surfaces.",
                    "Use `convex/broker_zone/*` or `convex/red_zone/*` for owner-scoped backend access patterns.",
                    "Keep App Router entry files thin and free from large business branching."
                ]
            },
            {
                title: "Current positioning of admin",
                paragraphs: [
                    "Admin is best treated as a monitoring and control surface over shared capabilities, not as a separate backend or a duplicate source of truth.",
                    "Many admin screens rely on joined operational projections built inside `convex/admin_zone/*`."
                ]
            }
        ],
        related: [
            "ui",
            "data",
            "workflow"
        ]
    },
    ui: {
        key: "ui",
        eyebrow: "UI surface catalog",
        title: "UI Components",
        summary: "These are the real reusable UI surfaces developers can access in admin and related workspace code.",
        intro: [
            "The admin app has its own shared component surface, and it intentionally mirrors some of the naming and layout patterns used in the workspace.",
            "That similarity is helpful, but ownership still matters: admin primitives should stay the default UI layer for admin work."
        ],
        sections: [
            {
                title: "Admin shared components",
                bullets: [
                    "`AdminShell` for global admin chrome and sidebar navigation.",
                    "`SectionScaffold` for route-backed section layout.",
                    "`PageHeader`, `PageHero`, and `Section` for page framing.",
                    "`WorkspacePanel`, `Card`, and `EmptyState` for content framing.",
                    "`DataTable`, `JsonPreview`, and `FormField` for data and input surfaces.",
                    "`StatCard`, `MetricGrid`, `StatusBadge`, and `InlineBarChart` for metrics and states."
                ]
            },
            {
                title: "Workspace shared references",
                bullets: [
                    "`web/components/shared/*` contains the workspace/public shared UI surface.",
                    "`Sidebar/*` is the shared workspace navigation primitive.",
                    "`WorkspacePanel`, `Card`, `PageHeader`, `PageHero`, `MetricGrid`, and `StatCard` closely mirror the admin naming model."
                ]
            },
            {
                title: "AI / workspace presentation layer",
                paragraphs: [
                    "`web/components/shared/ag-aui/*` contains a larger set of AI/workspace presentation components such as AI result cards, market blocks, property and offer action UIs, and orchestration-related presentation surfaces."
                ],
                callout: {
                    title: "Use with intent",
                    body: "These `ag-aui` components are useful as references when documenting or tracing AI output, but they are not the default admin shared component layer.",
                    tone: "info"
                }
            },
            {
                title: "When to choose each layer",
                table: {
                    headers: [
                        "Need",
                        "Preferred layer",
                        "Why"
                    ],
                    rows: [
                        [
                            "Reusable admin page primitive",
                            "admin/components/shared/*",
                            "Owned admin surface and matching admin chrome"
                        ],
                        [
                            "One-off page composition",
                            "Page-local component files",
                            "Avoid premature promotion into shared layer"
                        ],
                        [
                            "Reference for cross-surface patterns",
                            "web/components/shared/*",
                            "Useful for alignment and comparison"
                        ],
                        [
                            "AI presentation reference",
                            "web/components/shared/ag-aui/*",
                            "Relevant when tracing structured AI UI output"
                        ]
                    ]
                }
            }
        ],
        related: [
            "capabilities",
            "workflow",
            "aiChatflow"
        ]
    },
    data: {
        key: "data",
        eyebrow: "Model and contracts",
        title: "Data Model & Contracts",
        summary: "Understand ownership fields, state fields, and the main contract boundaries before changing data flow.",
        intro: [
            "Ownership in Anan is not represented by one single id type. Different flows belong to auth users, organizations, channel users, or hybrids of those concepts.",
            "The most common mistakes in this repo happen when code treats `status`, `publicationState`, and ownership ids as interchangeable."
        ],
        sections: [
            {
                title: "Core entities",
                bullets: [
                    "`userProfiles`, `users`, `brokers`, `RED`, `organizationMemberships`, and `teamInvites` define people and organizations.",
                    "`properties`, `offers`, `orders`, and `deals` define the core commercial lifecycle.",
                    "`knowledgePages`, `assistantThreads`, `assistantMessages`, `knowledgeResearch`, and `searchLogs` support AI and research flows.",
                    "`inboxConversations`, `inboxConversationParticipants`, `inboxMessages`, and `workspaceNotifications` support collaboration and operational awareness."
                ]
            },
            {
                title: "Ownership fields",
                table: {
                    headers: [
                        "Ownership type",
                        "Common fields",
                        "Used for"
                    ],
                    rows: [
                        [
                            "Auth-linked user",
                            "authUserId, userId",
                            "Sessions, assistant threads, inbox participants, notifications"
                        ],
                        [
                            "Organization owner",
                            "brokerId, REDId",
                            "Properties, subscriptions, ownership checks"
                        ],
                        [
                            "Offer sender / recipient",
                            "fromBrokerId, fromREDId, toBrokerId, toREDId",
                            "Offer targeting and response rights"
                        ],
                        [
                            "Channel user",
                            "users table userId",
                            "Non-auth / channel-linked user records"
                        ]
                    ]
                }
            },
            {
                title: "State fields",
                paragraphs: [
                    "`publicationState` controls visibility lifecycle such as draft, published, and archived.",
                    "`status` controls business outcome lifecycle such as availability, pending, qualified, accepted, or rejected depending on the table."
                ],
                callout: {
                    title: "Important rule",
                    body: "Do not collapse `publicationState` and `status` into one concept when implementing new behavior.",
                    tone: "warn"
                }
            },
            {
                title: "Contract boundaries",
                bullets: [
                    "`web/server/contracts/*` stabilizes shapes crossing between web UI and backend services.",
                    "The admin app effectively treats `admin/admin_zone/api/*` plus `convex/admin_zone/*` as its contract boundary.",
                    "The mobile surface relies on `convex/user_zone/mobile/contracts.ts` plus app-level mobile types."
                ]
            },
            {
                title: "Current caveat: knowledge scope",
                paragraphs: [
                    "The current assistant retrieval path reads from `knowledgePages` globally, even though some naming implies company-specific knowledge."
                ]
            }
        ],
        related: [
            "architecture",
            "aiChatflow",
            "workflow"
        ]
    },
    aiChatflow: {
        key: "aiChatflow",
        eyebrow: "Runtime map",
        title: "AI Chatflow",
        summary: "Anan has multiple AI-shaped flows, and they do not all use the same runtime or persistence path.",
        intro: [
            "The workspace assistant, WhatsApp channel path, and mobile assistant should be treated as related but distinct systems.",
            "Admin touches these flows through knowledge management, analytics, diagnostics, and activity visibility rather than by owning the AI runtime itself."
        ],
        sections: [
            {
                title: "System flow",
                codeBlock: {
                    label: "AI and chatflow overview",
                    code: [
                        "Workspace user -> assistant controller -> assistantService -> anan orchestrator -> assistantThreads/assistantMessages",
                        "WhatsApp user -> channel adapter -> assistantService/orchestration path -> shared assistant persistence",
                        "Mobile buyer -> mobile assistant endpoint -> property context + typed cards -> optional orders handoff",
                        "Admin -> knowledge pages + diagnostics/analytics/activity -> visibility into AI-related operations"
                    ].join("\n")
                }
            },
            {
                title: "Workspace assistant",
                bullets: [
                    "`convex/ai_zone/assistant.ts` stays thin and exposes public endpoints.",
                    "`convex/ai_zone/services/assistantService.ts` resolves owner identity, latest thread, entitlement mode, and injected knowledge.",
                    "`convex/ai_zone/agents/anan/*` owns orchestrator dispatch and team-agent execution."
                ]
            },
            {
                title: "WhatsApp channel path",
                paragraphs: [
                    "`convex/ai_zone/channels/whatsapp/*` handles channel-specific preprocessing and transport concerns, then feeds the shared AI runtime path."
                ]
            },
            {
                title: "Mobile assistant",
                paragraphs: [
                    "The mobile assistant is currently not the same as the shared orchestrated assistant flow. It uses property-aware deterministic logic and typed result cards in `convex/user_zone/mobile/assistant.ts`.",
                    "Qualified handoff from the mobile assistant can write into `orders`."
                ]
            },
            {
                title: "Persistence and admin touchpoints",
                bullets: [
                    "`assistantThreads` and `assistantMessages` persist shared assistant exchanges.",
                    "`knowledgePages` is managed from the admin knowledge page and feeds current assistant retrieval.",
                    "Admin diagnostics, analytics, and activity views observe assistant-related and message-related operational data."
                ]
            },
            {
                title: "Current caveats",
                bullets: [
                    "Knowledge retrieval is currently global rather than truly company-scoped.",
                    "The mobile assistant contract has known drift between UI and hook/type layers.",
                    "Assistant thread metadata such as mode and kind is soft enough to be patched over time."
                ]
            }
        ],
        related: [
            "data",
            "ui",
            "workflow"
        ]
    },
    workflow: {
        key: "workflow",
        eyebrow: "Contribution guide",
        title: "Development Workflow",
        summary: "Use this page when tracing a feature, deciding where code belongs, or checking the current repo baseline.",
        intro: [
            "The fastest way to work safely in this repo is to identify the owning layer first and then change the narrowest layer that actually owns the rule.",
            "This page is intentionally practical: where to look, where to add code, and what current checks to keep in mind."
        ],
        sections: [
            {
                title: "How to trace a feature",
                bullets: [
                    "Identify the surface: web, admin, mobile, or AI/channel path.",
                    "Find the thin entrypoint such as an App Router file, loader, or Convex controller.",
                    "Find the owning business layer such as `web/server/*`, `convex/shared_logic/*`, or a zone-specific module.",
                    "Confirm the ownership model: auth user, broker org, developer org, or channel user.",
                    "Check the relevant schema tables and any nearby tests before changing behavior."
                ]
            },
            {
                title: "Where to add code",
                bullets: [
                    "Use `web/server/*` for web-only orchestration and DTO boundaries.",
                    "Use `convex/shared_logic/*` for shared backend-owned rules.",
                    "Use `convex/broker_zone/*` and `convex/red_zone/*` for owner-scoped backend access patterns.",
                    "Use `admin/admin_zone/api/*` and `admin/admin_zone/pages/*` for admin-specific behavior."
                ]
            },
            {
                title: "Common commands",
                codeBlock: {
                    label: "Local development",
                    code: [
                        "pnpm install",
                        "pnpm dev",
                        "pnpm --dir web dev",
                        "pnpm --dir admin dev",
                        "pnpm --dir mobile dev",
                        "pnpm typecheck",
                        "pnpm --dir admin typecheck",
                        "pnpm --dir mobile typecheck"
                    ].join("\n")
                }
            },
            {
                title: "Current baseline",
                callout: {
                    title: "Known check state",
                    body: "Root typecheck currently passes. Admin typecheck currently fails due to a React type-version mismatch, and mobile typecheck currently fails due to assistant contract drift.",
                    tone: "warn"
                }
            },
            {
                title: "Testing expectations",
                bullets: [
                    "Prioritize tests for ownership checks, status transitions, unread counters, assistant thread behavior, and admin identity merge behavior.",
                    "Existing useful coverage already exists around inbox behavior, market aggregation, property-search helpers, and selected admin/web server paths.",
                    "Keep known baseline failures documented, but do not hide new regressions behind them."
                ]
            }
        ],
        related: [
            "capabilities",
            "data",
            "aiChatflow"
        ]
    }
};
function getDocsPage(pageKey) {
    return docsPages[pageKey];
}
function getDocsPageSiblings(pageKey) {
    const currentIndex = docsPageOrder.indexOf(pageKey);
    return {
        previousPageKey: currentIndex > 0 ? docsPageOrder[currentIndex - 1] : undefined,
        nextPageKey: currentIndex >= 0 && currentIndex < docsPageOrder.length - 1 ? docsPageOrder[currentIndex + 1] : undefined
    };
}
function getDocsSectionId(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
}),
"[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DocsSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/pages/DocsPage/registry.tsx [app-rsc] (ecmascript)");
;
;
function DocsSidebar({ page }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "hidden xl:block",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "sticky top-24 space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "border border-slate-200/70 bg-white p-5 shadow-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                            children: "On this page"
                        }, void 0, false, {
                            fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx",
                            lineNumber: 18,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 space-y-3",
                            children: page.sections.map((section)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: `#${(0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocsSectionId"])(section.title)}`,
                                    className: "block text-sm font-semibold leading-6 text-slate-700 hover:text-slate-950",
                                    children: section.title
                                }, section.title, false, {
                                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx",
                                    lineNumber: 21,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx",
                            lineNumber: 19,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "border border-slate-200/70 bg-slate-50/80 p-5 shadow-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                            children: "Handbook sequence"
                        }, void 0, false, {
                            fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx",
                            lineNumber: 33,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 space-y-3",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageOrder"].map((pageKey)=>{
                                const pageMeta = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageMeta"][pageKey];
                                const active = pageKey === page.key;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: pageMeta.href,
                                    className: [
                                        "block text-sm font-semibold leading-6",
                                        active ? "text-slate-950" : "text-slate-600 hover:text-slate-950"
                                    ].join(" "),
                                    children: pageMeta.label
                                }, pageMeta.href, false, {
                                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx",
                                    lineNumber: 40,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx",
            lineNumber: 16,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
}),
"[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DocsPageNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/pages/DocsPage/registry.tsx [app-rsc] (ecmascript)");
;
;
function DocsPageNav({ previousPageKey, nextPageKey }) {
    if (!previousPageKey && !nextPageKey) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "grid gap-4 border-t border-slate-200/70 pt-8 md:grid-cols-2",
        children: [
            previousPageKey ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                href: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageMeta"][previousPageKey].href,
                className: "block border border-slate-200 bg-slate-50/80 p-5 transition-colors hover:border-slate-300 hover:bg-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                        children: "Previous"
                    }, void 0, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 text-lg font-black tracking-tight text-slate-950",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageMeta"][previousPageKey].label
                    }, void 0, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx",
                        lineNumber: 27,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-sm font-semibold leading-6 text-slate-600",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageMeta"][previousPageKey].description
                    }, void 0, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx",
                        lineNumber: 28,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx",
                lineNumber: 22,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, void 0, false, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx",
                lineNumber: 31,
                columnNumber: 9
            }, this),
            nextPageKey ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                href: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageMeta"][nextPageKey].href,
                className: "block border border-slate-200 bg-slate-50/80 p-5 text-right transition-colors hover:border-slate-300 hover:bg-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                        children: "Next"
                    }, void 0, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 text-lg font-black tracking-tight text-slate-950",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageMeta"][nextPageKey].label
                    }, void 0, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-sm font-semibold leading-6 text-slate-600",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageMeta"][nextPageKey].description
                    }, void 0, false, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx",
                lineNumber: 35,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
}),
"[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DocsArticle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$DocsSectionPanel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$DocsSidebar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/pages/DocsPage/DocsSidebar.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$DocsPageNav$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/pages/DocsPage/DocsPageNav.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/pages/DocsPage/registry.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
function DocsArticle({ page }) {
    const { previousPageKey, nextPageKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocsPageSiblings"])(page.key);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                className: "min-w-0 border border-slate-200/70 bg-white shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "space-y-6 border-b border-slate-200/70 px-6 py-8 lg:px-10 lg:py-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inline-flex items-center gap-3 border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-slate-700",
                                        children: page.eyebrow ?? "Internal handbook"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                        lineNumber: 24,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                                        children: [
                                            page.sections.length,
                                            " sections"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                        lineNumber: 27,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                lineNumber: 23,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "max-w-5xl text-4xl font-black tracking-tight text-slate-950",
                                        children: page.title
                                    }, void 0, false, {
                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                        lineNumber: 33,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "max-w-4xl text-base font-semibold leading-8 text-slate-600",
                                        children: page.summary
                                    }, void 0, false, {
                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                        lineNumber: 34,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                lineNumber: 32,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: page.intro.map((paragraph)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "max-w-4xl text-sm font-semibold leading-7 text-slate-700",
                                        children: paragraph
                                    }, paragraph, false, {
                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                        lineNumber: 39,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-slate-200 bg-slate-50 p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                                                children: "What you will find here"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                lineNumber: 47,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-3 text-sm font-semibold leading-7 text-slate-700",
                                                children: "This page is part of the route-backed internal handbook. Use the local section links to skim, then move through the sequence with the previous and next cards at the bottom."
                                            }, void 0, false, {
                                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                lineNumber: 48,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                        lineNumber: 46,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-slate-200 bg-white p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[11px] font-black uppercase tracking-[0.22em] text-slate-500",
                                                children: "Related routes"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                lineNumber: 54,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-3 flex flex-wrap gap-2",
                                                children: page.related.map((relatedKey)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageMeta"][relatedKey].href,
                                                        className: "border border-slate-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950",
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageMeta"][relatedKey].label
                                                    }, relatedKey, false, {
                                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                        lineNumber: 57,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                lineNumber: 55,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                        lineNumber: 53,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-12 px-6 py-8 lg:px-10 lg:py-10",
                        children: [
                            page.sections.map((section)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$DocsSectionPanel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    section: section,
                                    sectionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocsSectionId"])(section.title)
                                }, section.title, false, {
                                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "space-y-4 border-t border-slate-200/70 pt-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-lg font-black tracking-tight text-slate-950",
                                                children: "Related pages"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                lineNumber: 77,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: "/docs",
                                                className: "text-sm font-black tracking-tight text-slate-600 hover:text-slate-950",
                                                children: "Back to overview"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                lineNumber: 78,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                        lineNumber: 76,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
                                        children: page.related.map((relatedKey)=>{
                                            const related = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["docsPageMeta"][relatedKey];
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: related.href,
                                                className: "block border border-slate-200 bg-slate-50/70 p-5 transition-colors hover:border-slate-300 hover:bg-white",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-lg font-black tracking-tight text-slate-950",
                                                            children: related.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                            lineNumber: 92,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-semibold leading-6 text-slate-600",
                                                            children: related.description
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                            lineNumber: 93,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                    lineNumber: 91,
                                                    columnNumber: 21
                                                }, this)
                                            }, related.href, false, {
                                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                                lineNumber: 86,
                                                columnNumber: 19
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                        lineNumber: 82,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$DocsPageNav$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                previousPageKey: previousPageKey,
                                nextPageKey: nextPageKey
                            }, void 0, false, {
                                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$DocsSidebar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                page: page
            }, void 0, false, {
                fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
}),
"[project]/admin/admin_zone/pages/DocsPage/index.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DocsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$DocsArticle$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/pages/DocsPage/DocsArticle.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/pages/DocsPage/registry.tsx [app-rsc] (ecmascript)");
;
;
;
function DocsPage({ pageKey }) {
    const page = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$registry$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocsPage"])(pageKey);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$DocsArticle$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        page: page
    }, void 0, false, {
        fileName: "[project]/admin/admin_zone/pages/DocsPage/index.tsx",
        lineNumber: 16,
        columnNumber: 10
    }, this);
}
}),
"[project]/admin/app/(docs)/docs/ai-chatflow/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DocsAiChatflowRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_dfe2944aa2de3f51ba172bc2570b2432/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/admin_zone/pages/DocsPage/index.tsx [app-rsc] (ecmascript)");
;
;
function DocsAiChatflowRoute() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_dfe2944aa2de3f51ba172bc2570b2432$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$admin_zone$2f$pages$2f$DocsPage$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        pageKey: "aiChatflow"
    }, void 0, false, {
        fileName: "[project]/admin/app/(docs)/docs/ai-chatflow/page.tsx",
        lineNumber: 9,
        columnNumber: 10
    }, this);
}
}),
"[project]/admin/app/(docs)/docs/ai-chatflow/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/admin/app/(docs)/docs/ai-chatflow/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__24ca48e2._.js.map