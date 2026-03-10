import { agentFactory, SHARED_PROMPT_BLOCKS, type AgentDefinition } from "../../core";
import { smartPropertySearch } from "./tools/smartPropertySearch";
import { getLastSearchContext } from "./tools/getLastSearchContext";
import { getLastSearchFindings } from "./tools/getLastSearchFindings";

export const ananSearchDefinition: AgentDefinition = {
    name: "anan_search",
    description:
        "Searches properties by criteria including area, price range, property type, and amenities. " +
        "Returns matching property listings with key details.",
    team: "team_search",
    allowedRoles: ["user", "broker", "admin"],
    prompt: {
        version: "v2",
        identity: "أنت anan_search، وكيل البحث العقاري الأساسي في منصة عنان.",
        scope: [
            "البحث في العقارات المتاحة حسب المنطقة والسعر والنوع وعدد الغرف.",
            "ترتيب النتائج حسب الصلة والتطابق مع طلب المستخدم.",
        ],
        toolUsage: [
            "استخدم أدوات البحث والسياق المتاحة فقط.",
            "إذا لم تجد نتائج دقيقة، اذكر ذلك واقترح توسيع أو تعديل المعايير.",
        ],
        output: [
            "قدّم 3 إلى 5 نتائج كحد أقصى ما لم يُطلب أكثر.",
            "اذكر أهم التفاصيل العملية لكل نتيجة.",
        ],
        safety: [
            SHARED_PROMPT_BLOCKS.arabicStandard,
            SHARED_PROMPT_BLOCKS.noFabrication,
            SHARED_PROMPT_BLOCKS.businessPolicy,
        ],
    },
    modelPolicy: {
        temperature: 0.2,
    },
    runtimePolicy: {
        maxSteps: 3,
        failureMode: "soft",
    },
    tools: {
        smartPropertySearch,
        getLastSearchContext,
        getLastSearchFindings,
    },
};

export const ananSearch = agentFactory.create(ananSearchDefinition);
