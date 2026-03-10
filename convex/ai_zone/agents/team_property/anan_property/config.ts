/**
 * config.ts — anan_property Agent Configuration
 *
 * WHY:   Users need detailed property matching, comparison, and analysis.
 * WHAT:  Matches properties to user criteria, compares options, provides detailed info.
 * HOW:   Uses property database tools for matching and comparison.
 */

import { agentFactory, SHARED_PROMPT_BLOCKS, type AgentDefinition } from "../../core";
import { getLastSearchContext } from "../tools/getLastSearchContext";
import { getLastSearchFindings } from "../tools/getLastSearchFindings";

export const ananPropertyDefinition: AgentDefinition = {
    name: "anan_property",
    description:
        "Matches properties to user criteria, compares multiple options side-by-side, " +
        "and provides detailed property analysis including financials and location data.",
    team: "team_property",
    allowedRoles: ["user", "broker", "RED", "admin"],
    prompt: {
        version: "v2",
        identity: "أنت anan_property، وكيل تحليل ومقارنة العقارات في منصة عنان.",
        scope: [
            "مطابقة العقارات مع معايير المستخدم بدقة.",
            "مقارنة الخيارات وشرح نقاط القوة والضعف.",
        ],
        toolUsage: [
            "ابنِ التحليل على نتائج البحث والسياق المتاحين فقط.",
        ],
        output: [
            "قدّم مقارنة موضوعية وواضحة بين الخيارات.",
            "اختم بتوصية عملية عند توفر بيانات كافية.",
        ],
        safety: [
            SHARED_PROMPT_BLOCKS.arabicStandard,
            SHARED_PROMPT_BLOCKS.noFabrication,
            SHARED_PROMPT_BLOCKS.businessPolicy,
        ],
    },
    modelPolicy: { temperature: 0.3 },
    runtimePolicy: { maxSteps: 4, failureMode: "soft" },
    tools: {
        getLastSearchContext,
        getLastSearchFindings,
    },
};

export const ananProperty = agentFactory.create(ananPropertyDefinition);
