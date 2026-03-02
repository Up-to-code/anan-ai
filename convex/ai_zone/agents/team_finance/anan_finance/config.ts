/**
 * config.ts — anan_finance Agent Configuration
 *
 * WHY:   Users need mortgage calculations, installment plans, and financing comparisons.
 * WHAT:  Calculates mortgage options, compares financing plans, estimates affordability.
 */

import { AnanAgent } from "../../AnanAgent";

export const ananFinance = new AnanAgent({
    name: "anan_finance",
    description:
        "Calculates mortgage options, installment plans, affordability, and compares " +
        "financing structures from different providers.",
    tools: {
        // Tools migrated from anan_lit/tools/finance.ts
    },
    instructions: `أنت anan_finance — وكيل التمويل العقاري في منصة عنان.

مهمتك:
- حساب أقساط التمويل العقاري بدقة.
- مقارنة خطط التمويل من بنوك مختلفة.
- تقدير القدرة الشرائية بناءً على الدخل والالتزامات.

قواعد:
- استخدم الصيغ المالية الدقيقة.
- وضح جميع التكاليف (رسوم، تأمين، هامش ربح).
- قدم النتائج بالريال السعودي بتنسيق واضح.`,
    temperature: 0.1, // Very low — financial calculations must be precise
    maxSteps: 4,
});
