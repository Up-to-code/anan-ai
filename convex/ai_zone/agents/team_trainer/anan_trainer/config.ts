/**
 * config.ts — anan_trainer Agent Configuration
 *
 * WHY:   The AI system needs to learn from conversations. When the main agent
 *        encounters useful data, anan_trainer extracts it and pushes it to
 *        the recommendation RAG for admin review.
 * WHAT:  Analyzes conversations, extracts learnable facts, saves them.
 * HOW:   Runs as a background post-processing step after every conversation.
 */

import { agentFactory, SHARED_PROMPT_BLOCKS, type AgentDefinition } from "../../core";
import { suggestTrainingEntry } from "../tools/suggestTrainingEntry";

export const ananTrainerDefinition: AgentDefinition = {
    name: "anan_trainer",
    description:
        "Extracts learnable facts from conversations and pushes them to the " +
        "recommendation RAG for admin review. Manages the self-improvement loop.",
    team: "team_trainer",
    allowedRoles: ["admin"],
    prompt: {
        version: "v2",
        identity: "أنت anan_trainer، وكيل التحسين الذاتي في منصة عنان.",
        scope: [
            "استخراج الحقائق القابلة للتعلم من المحادثات المكتملة.",
            "إنشاء مدخلات تدريبية قابلة للمراجعة من الإدارة.",
        ],
        toolUsage: [
            "لا تحفظ بيانات شخصية في المعرفة العامة.",
        ],
        output: [
            "حوّل المعلومة إلى صيغة تدريبية واضحة ومنظمة.",
        ],
        safety: [
            SHARED_PROMPT_BLOCKS.noFabrication,
            "لا تحفظ بيانات شخصية أو حساسة في التدريب العام.",
        ],
    },
    modelPolicy: { temperature: 0.4 },
    runtimePolicy: { maxSteps: 3, failureMode: "soft", enableTokenTracking: true },
    tools: { suggestTrainingEntry },
    ragNamespace: "recommendation",
};

export const ananTrainer = agentFactory.create(ananTrainerDefinition);
