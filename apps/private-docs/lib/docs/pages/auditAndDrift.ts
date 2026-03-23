import type { DocsPageDefinition } from "../types";

export const auditOverviewPage: DocsPageDefinition = {
  key: "audit-overview",
  href: "/docs/audit-overview",
  title: "Audit & Drift Overview",
  description: "Audit & Drift",
  summary:
    "This section keeps the current repo findings close to the intended architecture so engineers can move from diagnosis to the right handbook chapter without context switching.",
  intro: [
    "The audit material still matters, but it now lives alongside the broader handbook instead of defining the whole app.",
    "Read these pages after the foundations and runtime guides so the findings map cleanly to the intended model rather than feeling like isolated defects.",
  ],
  sections: [
    {
      id: "current-focus",
      title: "Current Focus Areas",
      links: [
        {
          href: "/docs/convex-review",
          label: "Convex Review",
          description: "Scan-heavy reads, correctness traps, and handbook mismatches in shared or user-facing backend paths.",
        },
        {
          href: "/docs/web-review",
          label: "Web Review",
          description: "Accessibility, focus-state, and motion issues in live workspace UI.",
        },
        {
          href: "/docs/documentation-gaps",
          label: "Documentation Gaps",
          description: "Missing manifests, handbook drift, and places where boundaries are under-documented.",
        },
        {
          href: "/docs/remediation-roadmap",
          label: "Remediation Roadmap",
          description: "Recommended fix order across backend, UI, and documentation work.",
        },
      ],
    },
    {
      id: "validation-snapshot",
      title: "Validation Snapshot",
      callouts: [
        {
          title: "Current Baseline",
          body: "The repo is not in emergency-triage mode. The highest-value work is architectural hardening, documentation clarity, and consistency with the rules the repo already claims to follow.",
          tone: "success",
        },
        {
          title: "Why This Section Exists",
          body: "The audit pages show where actual code paths diverge from the intended handbook model so future contributors can prioritize the highest-leverage corrections.",
          tone: "info",
        },
      ],
    },
    {
      id: "pairing-guide",
      title: "Pair These Findings With",
      links: [
        {
          href: "/docs/convex",
          label: "Convex",
          description: "Read the backend mental model before acting on scan and pagination findings.",
        },
        {
          href: "/docs/web",
          label: "Web",
          description: "Read the rendering and gateway model before addressing focus or motion issues.",
        },
        {
          href: "/docs/workflow",
          label: "Workflow",
          description: "Use the tracing and placement guide when turning findings into implementation tasks.",
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/backend-audit-2026-03-08.md",
      description: "Historical backend audit context that helped shape the current review set.",
    },
    {
      path: "docs/logic-audit-2026-03-13.md",
      description: "Historical logic-audit context referenced by the private handbook’s findings section.",
    },
    {
      path: "docs/handbook/admin/in-app-docs.md",
      description: "Reference for keeping curated in-app docs separate from deep markdown.",
    },
  ],
  related: ["convex-review", "web-review", "remediation-roadmap"],
};

export const convexReviewPage: DocsPageDefinition = {
  key: "convex-review",
  href: "/docs/convex-review",
  title: "Convex Review",
  description: "Audit & Drift",
  summary:
    "The most important Convex issues are scale and correctness hazards in shared or user-facing reads, especially where the code conflicts with the repo’s own index-first handbook rules.",
  intro: [
    "These findings matter because they sit close to shared capabilities or user-visible paths, which means small inefficiencies can become platform-wide costs as data volume grows.",
    "The goal here is not just to list defects. It is to tie each issue back to the owning rule so the fix is architecturally consistent.",
  ],
  sections: [
    {
      id: "priority-findings",
      title: "Highest-Priority Findings",
      findings: [
        {
          title: "Market snapshot query scans three growing tables",
          severity: "critical",
          summary:
            "The market snapshot that backs the workspace market experience collects full `properties`, `knowledgeResearch`, and `searchLogs` tables before aggregating them in memory. This turns a user-facing read into a scan-heavy query whose latency and cost will rise with platform growth.",
          evidence: [
            "convex/shared_logic/market.ts:112-132",
            "ctx.db.query(\"properties\").collect()",
            "ctx.db.query(\"knowledgeResearch\").collect()",
            "ctx.db.query(\"searchLogs\").collect()",
          ],
          ruleRefs: [
            "docs/handbook/convex/best-practices.md: index-first reads, not growing-table scans",
            "docs/handbook/web/ssr-performance.md: prefer summary queries over list-then-reduce",
          ],
          recommendations: [
            "Replace full-table aggregation with indexed summaries or a persisted snapshot strategy.",
            "Separate interactive filtering from historical analytics so the user-facing path stops paying the full history cost.",
          ],
        },
        {
          title: "Invite lookup linearly scans all user profiles by email",
          severity: "high",
          summary:
            "Team invite creation collects the entire `userProfiles` table just to find one email match. As profile count grows, invite creation becomes slower and more expensive than it needs to be.",
          evidence: [
            "convex/shared_logic/agencies/repositories/invites.helpers.ts:59-62",
            "return (await ctx.db.query(\"userProfiles\").collect()).find(...)",
          ],
          ruleRefs: [
            "docs/handbook/convex/best-practices.md: use indexes for lookup paths",
          ],
          recommendations: [
            "Add a normalized email lookup path and an index-backed repository helper.",
            "Centralize email normalization so other invite or membership flows do not recreate the same scan pattern.",
          ],
        },
        {
          title: "Bank bundle reads rely on fixed-size `take()` windows",
          severity: "medium",
          summary:
            "The bank queries use `take(limit)` and `take(50)` for list and bundle flattening, which works only while the catalog stays smaller than those hardcoded windows. Once it grows, results become incomplete without any signal to callers.",
          evidence: [
            "convex/shared_logic/banks/queries.ts:9-13",
            "convex/shared_logic/banks/queries.ts:31-37",
          ],
          ruleRefs: [
            "docs/handbook/convex/README.md: avoid `take(N)` correctness traps on growing datasets",
          ],
          recommendations: [
            "Decide whether the bank catalog is intentionally bounded or convert the read paths to explicit pagination.",
            "Split bundle listing from bank listing so callers can request a stable page rather than relying on implicit first-N reads.",
          ],
        },
      ],
    },
    {
      id: "alignment",
      title: "Why These Findings Matter",
      bullets: [
        "The repo already documents index-first querying and warns against list-then-reduce aggregation on growing tables.",
        "Because these paths live near shared or workspace-visible capabilities, the fix order should prioritize them before less-frequent admin analytics scans.",
      ],
    },
    {
      id: "pairing",
      title: "Read Alongside",
      links: [
        {
          href: "/docs/convex",
          label: "Convex",
          description: "The owning backend mental model and placement rules.",
        },
        {
          href: "/docs/zones",
          label: "Zones & Ownership",
          description: "Why these shared and user-facing paths matter more than isolated reporting code.",
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/convex/best-practices.md",
      description: "The primary rules these findings are measured against.",
    },
    {
      path: "convex/shared_logic/market.ts",
      description: "Current market snapshot implementation under review.",
    },
    {
      path: "convex/shared_logic/agencies/repositories/invites.helpers.ts",
      description: "Invite lookup implementation under review.",
    },
    {
      path: "convex/shared_logic/banks/queries.ts",
      description: "Bank query implementation under review.",
    },
  ],
  related: ["audit-overview", "convex", "remediation-roadmap"],
};

export const webReviewPage: DocsPageDefinition = {
  key: "web-review",
  href: "/docs/web-review",
  title: "Web Review",
  description: "Audit & Drift",
  summary:
    "The largest web issues are not broken layouts; they are accessibility and interaction-quality gaps in live workspace controls, especially labels, focus treatments, and `transition-all` usage.",
  intro: [
    "The web surface already has strong structure. The highest-leverage cleanup is in shared interaction quality rather than wholesale layout redesign.",
    "Most findings here are system patterns, not one-off component defects, so the eventual fixes should land in shared primitives or workspace conventions.",
  ],
  sections: [
    {
      id: "priority-findings",
      title: "Highest-Priority Findings",
      findings: [
        {
          title: "Market filter controls are visually labeled but not programmatically labeled",
          severity: "high",
          summary:
            "The market filter form uses absolutely-positioned `<span>` elements as pseudo-labels for `select` and `input` controls. Screen readers do not treat those spans as labels, so the controls lose accessible names despite looking labeled on screen.",
          evidence: [
            "apps/web/app/(ws)/ws/(zones)/market/MarketPage/MarketFilters.tsx:25-29",
            "apps/web/app/(ws)/ws/(zones)/market/MarketPage/MarketFilters.tsx:43-49",
            "apps/web/app/(ws)/ws/(zones)/market/MarketPage/MarketFilters.tsx:63-67",
            "apps/web/app/(ws)/ws/(zones)/market/MarketPage/MarketFilters.tsx:80-85",
          ],
          ruleRefs: [
            "Web interface rule: form controls need real labels or explicit accessible names",
          ],
          recommendations: [
            "Wrap each control in a real `<label>` or attach `aria-label` or `aria-labelledby` tied to visible text.",
            "Adopt one shared workspace field pattern so future filter forms inherit accessible markup by default.",
          ],
        },
        {
          title: "Mobile drawer and trigger use `transition-all` for interactive motion",
          severity: "medium",
          summary:
            "The workspace sidebar trigger, drawer, and close button use `transition-all`, which broadens the animation surface and conflicts with the repo’s adopted motion rule of explicitly listing animated properties.",
          evidence: [
            "apps/web/app/(ws)/ws/_components/WorkspaceSidebarDrawer.tsx:43",
            "apps/web/app/(ws)/ws/_components/WorkspaceSidebarDrawer.tsx:58",
            "apps/web/app/(ws)/ws/_components/WorkspaceSidebarDrawer.tsx:82",
          ],
          ruleRefs: [
            "Web interface rule: never use `transition: all`; list properties explicitly",
          ],
          recommendations: [
            "Replace `transition-all` with explicit property lists such as `transition-[transform,opacity,box-shadow,border-color]`.",
            "Document the motion rule in the handbook so shell-level UI stays consistent.",
          ],
        },
        {
          title: "Workspace search input removes the default outline without a `focus-visible` replacement",
          severity: "medium",
          summary:
            "The inbox sidebar search field uses `outline-none` and focus styles that depend on `focus:` classes, but it does not restore a strong `focus-visible` treatment. Keyboard users can lose a clear focus ring in an important navigation control.",
          evidence: [
            "apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/components/InboxSidebar.tsx:166-169",
          ],
          ruleRefs: [
            "Web interface rule: never remove outlines without a visible focus replacement",
            "Web interface rule: prefer `:focus-visible` over broad `:focus` patterns",
          ],
          recommendations: [
            "Standardize a shared input class with strong `focus-visible` treatment.",
            "Sweep other workspace forms for `outline-none` patterns that only provide weak border feedback.",
          ],
        },
      ],
    },
    {
      id: "pattern-spread",
      title: "Pattern Spread",
      bullets: [
        "Similar focus and form-label issues appear in other workspace controls such as offer search, CRM forms, and AG UI surfaces.",
        "This should be treated as a shared-system issue rather than patched one component at a time.",
      ],
    },
    {
      id: "pairing",
      title: "Read Alongside",
      links: [
        {
          href: "/docs/web",
          label: "Workspace + Public Web",
          description: "The intended layering and the documented real-time exception.",
        },
        {
          href: "/docs/workflow",
          label: "Workflow",
          description: "How to turn these findings into shared-primitives work instead of route-level patchwork.",
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "apps/web/app/(ws)/ws/(zones)/market/MarketPage/MarketFilters.tsx",
      description: "Workspace market filter implementation under review.",
    },
    {
      path: "apps/web/app/(ws)/ws/_components/WorkspaceSidebarDrawer.tsx",
      description: "Sidebar drawer and trigger motion patterns under review.",
    },
    {
      path: "apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/components/InboxSidebar.tsx",
      description: "Focus treatment example used in the findings above.",
    },
  ],
  related: ["audit-overview", "web", "remediation-roadmap"],
};

export const documentationGapsPage: DocsPageDefinition = {
  key: "documentation-gaps",
  href: "/docs/documentation-gaps",
  title: "Documentation Gaps",
  description: "Audit & Drift",
  summary:
    "The repo already has meaningful handbook material, but high-signal folders still lack local manifests and a few docs surfaces risk drifting from one another.",
  intro: [
    "Documentation gaps are an architecture issue in this repo, not just an onboarding inconvenience, because folder manifests are part of how boundary ownership is communicated.",
    "When the docs surface drifts from the live folder structure, contributors end up guessing where capabilities belong and the code starts reflecting those guesses.",
  ],
  sections: [
    {
      id: "coverage-snapshot",
      title: "Coverage Snapshot",
      callouts: [
        {
          title: "What The Audit Found",
          body: "A shallow pass found many Convex and web directories with code but no local `README.md` or `ZONE_README.md`, especially around security, inbox, market analytics, assistant services, and workspace roots.",
          tone: "warning",
        },
      ],
      bullets: [
        "Representative Convex gaps include `convex/_core/security`, `convex/shared_logic/inbox`, `convex/shared_logic/market/analytics`, `convex/ai_zone/services/assistantService`, and `convex/admin_zone/users`.",
        "Representative web gaps include `apps/web/app/(ws)`, `apps/web/app/api/organizations`, `apps/web/server/domains/compliance`, `apps/web/server/market`, `apps/web/components/ui`, and `apps/web/lib/docs`.",
      ],
    },
    {
      id: "drift-risks",
      title: "Drift Risks",
      findings: [
        {
          title: "Public docs content is split across two app surfaces",
          severity: "medium",
          summary:
            "The repo keeps public docs content in both `apps/docs` and `apps/web/lib/docs/*`, which raises the chance that public-facing documentation changes unevenly across surfaces.",
          evidence: [
            "apps/docs/lib/docs/registry.ts",
            "apps/web/lib/docs/registry.ts",
            "apps/web/lib/docs/pages/index.ts",
          ],
          recommendations: [
            "Use this private handbook pass to clarify the internal taxonomy first, then evaluate whether the public docs registries should share one source shape later.",
          ],
        },
        {
          title: "The real-time Convex hook exception is still under-documented",
          severity: "low",
          summary:
            "The web handbook emphasizes the server gateway, while some live workspace features intentionally use direct Convex hooks for real-time behavior. The exception is valid, but it was not clearly named until this handbook pass.",
          evidence: [
            "docs/handbook/web/README.md",
            "apps/web/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/useWorkspaceAssistant.ts",
            "apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/useRealtimeInbox.ts",
          ],
          recommendations: [
            "Keep the exception explicit in the handbook and limit it to live subscription-driven surfaces.",
          ],
        },
      ],
    },
    {
      id: "why-it-matters",
      title: "Why It Matters",
      paragraphs: [
        "The repo’s own architectural rules call for manifests in major folders and WHY/WHAT/HOW comments around exported modules. Missing manifests make ownership harder to see before an engineer starts coding.",
        "That means documentation completeness affects code placement quality directly.",
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/admin/in-app-docs.md",
      description: "Reference for keeping curated in-app docs honest about the deeper source of truth.",
    },
    {
      path: "apps/docs/lib/docs/registry.ts",
      description: "One of the current public docs registries that may drift over time.",
    },
    {
      path: "apps/web/lib/docs/registry.ts",
      description: "The other public docs registry surface mentioned in the findings.",
    },
  ],
  related: ["audit-overview", "zones", "remediation-roadmap"],
};

export const remediationRoadmapPage: DocsPageDefinition = {
  key: "remediation-roadmap",
  href: "/docs/remediation-roadmap",
  title: "Remediation Roadmap",
  description: "Audit & Drift",
  summary:
    "The recommended order is to harden shared and user-facing Convex reads first, then standardize workspace accessibility and motion patterns, then close the documentation gaps that let the same issues reappear.",
  intro: [
    "This roadmap is deliberately ordered by leverage. It starts with the backend paths that affect shared correctness and user-facing latency, then moves to system-level UI quality, then closes documentation gaps that prevent the fixes from drifting back out.",
    "The goal is not to fix everything at once. It is to fix the most reusable pressure points first.",
  ],
  sections: [
    {
      id: "phase-one",
      title: "Phase 1: Shared And User-Facing Convex Hotspots",
      bullets: [
        "Replace the market snapshot collectors with filtered or indexed summary queries or a persisted snapshot projection.",
        "Add a normalized email lookup path for invite resolution so team invites stop scanning `userProfiles`.",
        "Decide whether the bank catalog is intentionally bounded; if not, convert fixed-window reads to pagination.",
      ],
      callouts: [
        {
          title: "Definition Of Done",
          body: "User-facing and shared reads should stop relying on broad `collect()` or implicit first-N truncation where correctness depends on a bounded dataset.",
          tone: "info",
        },
      ],
    },
    {
      id: "phase-two",
      title: "Phase 2: Workspace Accessibility And Motion Primitives",
      bullets: [
        "Introduce one shared labeled-field pattern for workspace filters and forms.",
        "Sweep `outline-none` inputs and replace them with strong `focus-visible` treatments.",
        "Replace `transition-all` in shell and form primitives with explicit property lists.",
      ],
    },
    {
      id: "phase-three",
      title: "Phase 3: Documentation Coverage And Drift",
      bullets: [
        "Add README or ZONE_README coverage to the highest-traffic missing folders first: security, inbox, market analytics, assistant services, and workspace root surfaces.",
        "Keep the real-time Convex hook exception explicit in handbook material.",
        "Evaluate future consolidation of public docs registries after the handbook taxonomy stabilizes.",
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/logic-audit-2026-03-13.md",
      description: "Historical logic audit that complements the current remediation direction.",
    },
    {
      path: "docs/backend-audit-2026-03-08.md",
      description: "Historical backend audit context.",
    },
    {
      path: "docs/handbook/convex/best-practices.md",
      description: "Primary source for the backend remediation philosophy.",
    },
  ],
  related: ["audit-overview", "convex-review", "web-review"],
};

export const auditAndDriftPages = [
  auditOverviewPage,
  convexReviewPage,
  webReviewPage,
  documentationGapsPage,
  remediationRoadmapPage,
] as const;
