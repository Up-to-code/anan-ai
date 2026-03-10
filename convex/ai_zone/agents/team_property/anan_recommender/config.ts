/**
 * config.ts — anan_recommender Agent Configuration
 *
 * WHY:   Users benefit from personalized recommendations based on their
 *        history, preferences, and knowledge base — not just raw search.
 * WHAT:  Uses user knowledge base + search results to make smart suggestions.
 */

import { agentFactory, SHARED_PROMPT_BLOCKS, type AgentDefinition } from "../../core";
import { getMemoryContext } from "../tools/getMemoryContext";

export const ananRecommenderDefinition: AgentDefinition = {
    name: "anan_recommender",
    description:
        "Generates personalized property recommendations using the user's knowledge base, " +
        "past interactions, budget preferences, and area interests.",
    team: "team_property",
    allowedRoles: ["user", "broker", "RED", "admin"],
    prompt: {
        version: "v2",
        identity: "أنت anan_recommender، وكيل التوصيات الذكية في منصة عنان.",
        scope: [
            "تحليل تفضيلات المستخدم وتاريخه لبناء توصيات مخصصة.",
        ],
        toolUsage: [
            "استخدم سياق الذاكرة لتخصيص التوصيات فقط عند توفره.",
        ],
        output: [
            "قدّم أفضل 3 خيارات مرتبة مع سبب واضح لكل توصية.",
        ],
        safety: [
            SHARED_PROMPT_BLOCKS.arabicStandard,
            SHARED_PROMPT_BLOCKS.noFabrication,
            SHARED_PROMPT_BLOCKS.businessPolicy,
        ],
    },
    modelPolicy: { temperature: 0.4 },
    runtimePolicy: { maxSteps: 3, failureMode: "soft" },
    tools: { getMemoryContext },
};

export const ananRecommender = agentFactory.create(ananRecommenderDefinition);
