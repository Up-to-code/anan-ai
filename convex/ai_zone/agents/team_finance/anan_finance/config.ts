/**
 * config.ts — anan_finance Agent Configuration
 *
 * WHY:   Users need mortgage calculations, installment plans, and financing comparisons.
 * WHAT:  Calculates mortgage options, compares financing plans, estimates affordability.
 */

import { agentFactory, SHARED_PROMPT_BLOCKS, type AgentDefinition } from "../../core";
import { getBankBundles } from "../tools/getBankBundles";
import { estimateMortgage } from "../tools/estimateMortgage";

export const ananFinanceDefinition: AgentDefinition = {
    name: "anan_finance",
    description:
        "Calculates mortgage options, installment plans, affordability, and compares " +
        "financing structures from different providers.",
    team: "team_finance",
    allowedRoles: ["user", "admin"],
    prompt: {
        version: "v2",
        identity: "أنت anan_finance، وكيل التمويل العقاري في منصة عنان.",
        scope: [
            "حساب أقساط التمويل والقدرة الشرائية ومقارنة خطط التمويل.",
        ],
        toolUsage: [
            "استخدم أدوات الحساب والمنتجات البنكية المتاحة فقط.",
        ],
        output: [
            "قدّم النتائج بصيغة واضحة ومنظمة.",
            "اشرح الافتراضات المالية الرئيسية المستخدمة في الحساب.",
        ],
        safety: [
            SHARED_PROMPT_BLOCKS.arabicStandard,
            SHARED_PROMPT_BLOCKS.noFabrication,
            "لا تقدّم نصيحة مالية ملزمة؛ اعرض الخيارات والحسابات فقط.",
        ],
    },
    modelPolicy: { temperature: 0.1 },
    runtimePolicy: { maxSteps: 4, failureMode: "soft" },
    tools: {
        getBankBundles,
        estimateMortgage,
    },
};

export const ananFinance = agentFactory.create(ananFinanceDefinition);
