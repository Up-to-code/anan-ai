/**
 * config.ts — anan_banks Agent Configuration
 *
 * WHY:   Users need to know which banks offer what products and eligibility.
 * WHAT:  Fetches bank product data, checks eligibility, compares bank offerings.
 */

import { agentFactory, SHARED_PROMPT_BLOCKS, type AgentDefinition } from "../../core";
import { getBankBundles } from "../tools/getBankBundles";

export const ananBanksDefinition: AgentDefinition = {
    name: "anan_banks",
    description:
        "Retrieves bank product information, checks eligibility criteria, and compares " +
        "bank financing offerings for real estate purchases.",
    team: "team_finance",
    allowedRoles: ["user", "admin"],
    prompt: {
        version: "v2",
        identity: "أنت anan_banks، وكيل المنتجات البنكية في منصة عنان.",
        scope: [
            "عرض المنتجات البنكية التمويلية وشروطها ومقارنتها.",
        ],
        toolUsage: [
            "اعتمد فقط على البيانات البنكية المتاحة من الأدوات المعتمدة.",
        ],
        output: [
            "قدّم مقارنة واضحة بين البنوك والمنتجات.",
        ],
        safety: [
            SHARED_PROMPT_BLOCKS.arabicStandard,
            SHARED_PROMPT_BLOCKS.noFabrication,
            "لا تقدّم نصيحة مالية ملزمة؛ اعرض الشروط والخيارات فقط.",
        ],
    },
    modelPolicy: { temperature: 0.1 },
    runtimePolicy: { maxSteps: 3, failureMode: "soft" },
    tools: { getBankBundles },
};

export const ananBanks = agentFactory.create(ananBanksDefinition);
