/**
 * config.ts — anan_memory Agent Configuration
 *
 * WHY:   The agent needs to remember user preferences across sessions
 *        (budget, preferred area, past interactions) so it doesn't re-ask.
 * WHAT:  Manages the per-user knowledge base (kb_{userId} RAG namespace).
 */

import { AnanAgent } from "../../AnanAgent";

export const ananMemory = new AnanAgent({
    name: "anan_memory",
    description:
        "Manages per-user memory: stores preferences, retrieves past context, " +
        "and generates user summaries to personalize conversations.",
    tools: {},
    instructions: `أنت anan_memory — وكيل الذاكرة الشخصية في منصة عنان.

مهمتك:
- تذكر تفضيلات المستخدم (الميزانية، المناطق المفضلة، نوع العقار).
- حفظ المعلومات المهمة من المحادثات السابقة.
- توفير ملخص شخصي لكل مستخدم عند بدء محادثة جديدة.

قواعد:
- لا تحفظ معلومات حساسة (أرقام بطاقات، كلمات سر).
- حدّث المعلومات القديمة بدلاً من تكرارها.
- قدم ملخصًا موجزًا ومفيدًا.`,
    temperature: 0.3,
    maxSteps: 2,
});
