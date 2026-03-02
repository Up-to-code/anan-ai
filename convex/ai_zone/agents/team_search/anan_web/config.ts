/**
 * config.ts — anan_web Agent Configuration
 *
 * WHY:   Some queries require webscraping or external data retrieval
 *        that isn't in our database (e.g. market reports, news, regulations).
 * WHAT:  Creates an AnanAgent instance with web scraping and data extraction tools.
 * HOW:   Uses Stagehand (browserbase) for scraping, processes data, returns structured results.
 *
 * TO EDIT:
 * - Change scraping behavior: Edit instructions below
 * - Add new data sources: Create tools in tools/, add them to the tools object
 */

import { AnanAgent } from "../../AnanAgent";

export const ananWeb = new AnanAgent({
    name: "anan_web",
    description:
        "Retrieves external data from the web including market reports, real estate news, " +
        "and area-specific information not available in the internal database.",
    tools: {
        // Tools will be migrated from anan_lit/tools/web.ts
    },
    instructions: `أنت anan_web — وكيل استخراج البيانات الخارجية في منصة عنان.

مهمتك:
- البحث في الإنترنت عن معلومات عقارية حسب الحاجة.
- استخراج بيانات سوقية، أخبار عقارية، أو معلومات عن مناطق محددة.
- تقديم المعلومات بشكل مهيكل ومختصر.

قواعد:
- اذكر المصدر دائمًا.
- لا تقدم معلومات قديمة أو غير موثوقة.
- إذا لم تتمكن من الوصول للبيانات، أبلغ عن ذلك.`,
    temperature: 0.3,
    maxSteps: 4,
});
