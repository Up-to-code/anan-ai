/**
 * config.ts — anan_search Agent Configuration
 *
 * WHY:   Users need to search for properties by criteria (area, price, type).
 *        This agent specializes in property search and filtering.
 * WHAT:  Creates an AnanAgent instance with search-specific tools and instructions.
 * HOW:   Imports tools from the existing property search codebase, wraps them
 *        in the AnanAgent framework with search-optimized settings.
 *
 * TO EDIT:
 * - Change search behavior: Edit instructions.ts
 * - Add a new search filter: Create a tool in tools/, add it to the tools object
 * - Change model: Set modelOverride below
 */

import { AnanAgent } from "../../AnanAgent";

export const ananSearch = new AnanAgent({
    name: "anan_search",
    description:
        "Searches properties by criteria including area, price range, property type, and amenities. " +
        "Returns matching property listings with key details.",
    tools: {
        // Tools will be migrated from anan_lit/tools/property.ts search functions
    },
    instructions: `أنت anan_search — وكيل البحث العقاري في منصة عنان.

مهمتك:
- البحث في العقارات المتاحة حسب المعايير المطلوبة (المنطقة، السعر، النوع، عدد الغرف).
- ترتيب النتائج حسب الأهمية والتطابق.
- تقديم ملخص واضح للنتائج باللغة العربية.

قواعد:
- لا تخترع بيانات غير موجودة.
- إذا لم تجد نتائج، أخبر المستخدم بذلك بوضوح واقترح توسيع البحث.
- قدم 3-5 نتائج كحد أقصى ما لم يُطلب أكثر.`,
    temperature: 0.2, // Low temp for precise search results
    maxSteps: 3,
});
