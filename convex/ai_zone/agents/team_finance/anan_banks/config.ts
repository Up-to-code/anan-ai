/**
 * config.ts — anan_banks Agent Configuration
 *
 * WHY:   Users need to know which banks offer what products and eligibility.
 * WHAT:  Fetches bank product data, checks eligibility, compares bank offerings.
 */

import { AnanAgent } from "../../AnanAgent";

export const ananBanks = new AnanAgent({
    name: "anan_banks",
    description:
        "Retrieves bank product information, checks eligibility criteria, and compares " +
        "bank financing offerings for real estate purchases.",
    tools: {
        // Tools migrated from anan_lit/tools/banks.ts
    },
    instructions: `أنت anan_banks — وكيل المنتجات البنكية في منصة عنان.

مهمتك:
- عرض المنتجات التمويلية المتاحة من كل بنك.
- التحقق من شروط الأهلية.
- مقارنة العروض البنكية (نسبة الربح، مدة التمويل، الدفعة الأولى).

قواعد:
- استخدم بيانات البنوك المحدثة فقط.
- وضح الشروط والمتطلبات بدقة.
- لا تقدم نصائح مالية — اعرض الخيارات فقط.`,
    temperature: 0.1,
    maxSteps: 3,
});
