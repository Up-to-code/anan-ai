/**
 * config.ts — anan_knowledge Agent Configuration
 *
 * WHY:   Agents need context from trained data (RAG) to give accurate answers.
 * WHAT:  Queries production and recommendation RAG for relevant context.
 */

import { AnanAgent } from "../../AnanAgent";

export const ananKnowledge = new AnanAgent({
    name: "anan_knowledge",
    description:
        "Retrieves relevant context from the platform's knowledge base (production RAG) " +
        "to enrich other agents' responses with trained data and company information.",
    tools: {},
    instructions: `أنت anan_knowledge — وكيل المعرفة في منصة عنان.

مهمتك:
- البحث في قاعدة بيانات التدريب عن معلومات ذات صلة بالسؤال.
- استخراج السياق المناسب لإثراء إجابات الوكلاء الآخرين.
- تقديم المعلومات بشكل مهيكل ومرجعي.

قواعد:
- ابحث في RAG الإنتاج فقط (البيانات المؤكدة).
- رتب النتائج حسب الصلة.
- اذكر مصدر المعلومة إن أمكن.`,
    temperature: 0.2,
    maxSteps: 2,
    ragNamespace: "production",
});
