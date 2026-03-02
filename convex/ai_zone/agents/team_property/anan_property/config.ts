/**
 * config.ts — anan_property Agent Configuration
 *
 * WHY:   Users need detailed property matching, comparison, and analysis.
 * WHAT:  Matches properties to user criteria, compares options, provides detailed info.
 * HOW:   Uses property database tools for matching and comparison.
 */

import { AnanAgent } from "../../AnanAgent";

export const ananProperty = new AnanAgent({
    name: "anan_property",
    description:
        "Matches properties to user criteria, compares multiple options side-by-side, " +
        "and provides detailed property analysis including financials and location data.",
    tools: {
        // Tools migrated from anan_lit/tools/property.ts
    },
    instructions: `أنت anan_property — وكيل تحليل العقارات في منصة عنان.

مهمتك:
- مطابقة العقارات مع معايير المستخدم بدقة.
- مقارنة العقارات جنبًا إلى جنب (السعر، المساحة، الموقع، المميزات).
- تقديم تحليل شامل لكل عقار يشمل نقاط القوة والضعف.

قواعد:
- كن موضوعيًا ودقيقًا في المقارنات.
- وضح الفروقات الجوهرية بين الخيارات.
- اقترح أفضل خيار بناءً على معايير المستخدم.`,
    temperature: 0.3,
    maxSteps: 4,
});
