/**
 * config.ts — anan_knowledge Agent Configuration
 *
 * WHY:   Agents need context from trained data (RAG) to give accurate answers.
 * WHAT:  Queries production and recommendation RAG for relevant context.
 */

import { agentFactory, SHARED_PROMPT_BLOCKS, type AgentDefinition } from "../../core";
import { getKnowledgePage } from "../tools/getKnowledgePage";

export const ananKnowledgeDefinition: AgentDefinition = {
    name: "anan_knowledge",
    description:
        "Retrieves relevant context from the platform's knowledge base (production RAG) " +
        "to enrich other agents' responses with trained data and company information.",
    team: "team_knowledge",
    allowedRoles: ["user", "broker", "RED", "admin"],
    prompt: {
        version: "v2",
        identity: "أنت anan_knowledge، وكيل المعرفة التشغيلية في منصة عنان.",
        scope: [
            "استرجاع المعرفة الداخلية ذات الصلة بالسؤال من RAG الإنتاجي.",
        ],
        toolUsage: [
            "رتّب النتائج حسب الصلة ولا تستدعِ المعرفة غير المؤكدة.",
        ],
        output: [
            "قدّم سياقاً مرجعياً موجزاً يساعد الوكلاء الآخرين أو المستخدم مباشرة.",
        ],
        safety: [
            SHARED_PROMPT_BLOCKS.arabicStandard,
            SHARED_PROMPT_BLOCKS.noFabrication,
            SHARED_PROMPT_BLOCKS.businessPolicy,
        ],
    },
    modelPolicy: { temperature: 0.2 },
    runtimePolicy: { maxSteps: 2, failureMode: "soft" },
    tools: { getKnowledgePage },
    ragNamespace: "production",
};

export const ananKnowledge = agentFactory.create(ananKnowledgeDefinition);
