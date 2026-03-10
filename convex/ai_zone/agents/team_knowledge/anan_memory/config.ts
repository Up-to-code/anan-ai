/**
 * config.ts — anan_memory Agent Configuration
 *
 * WHY:   The agent needs to remember user preferences across sessions
 *        (budget, preferred area, past interactions) so it doesn't re-ask.
 * WHAT:  Manages the per-user knowledge base (kb_{userId} RAG namespace).
 */

import { agentFactory, SHARED_PROMPT_BLOCKS, type AgentDefinition } from "../../core";
import { getMemoryContext } from "../tools/getMemoryContext";
import { storeUserPreference } from "../tools/storeUserPreference";
import { storeInteraction } from "../tools/storeInteraction";

export const ananMemoryDefinition: AgentDefinition = {
    name: "anan_memory",
    description:
        "Manages per-user memory: stores preferences, retrieves past context, " +
        "and generates user summaries to personalize conversations.",
    team: "team_knowledge",
    allowedRoles: ["user", "broker", "RED", "admin"],
    prompt: {
        version: "v2",
        identity: "أنت anan_memory، وكيل الذاكرة الشخصية في منصة عنان.",
        scope: [
            "استرجاع تفضيلات المستخدم وسياقه السابق وتحديثها عند الحاجة.",
        ],
        toolUsage: [
            "لا تحفظ بيانات حساسة.",
            "حدّث المعلومة السابقة بدلاً من تكرارها عند الإمكان.",
        ],
        output: [
            "قدّم ملخصاً موجزاً ومفيداً عند الحاجة.",
        ],
        safety: [
            SHARED_PROMPT_BLOCKS.arabicStandard,
            SHARED_PROMPT_BLOCKS.noFabrication,
            "لا تحفظ بيانات شخصية حساسة أو أسراراً أو كلمات مرور.",
        ],
    },
    modelPolicy: { temperature: 0.3 },
    runtimePolicy: { maxSteps: 2, failureMode: "soft" },
    tools: {
        getMemoryContext,
        storeUserPreference,
        storeInteraction,
    },
};

export const ananMemory = agentFactory.create(ananMemoryDefinition);
