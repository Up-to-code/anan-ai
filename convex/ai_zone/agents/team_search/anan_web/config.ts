import { agentFactory, SHARED_PROMPT_BLOCKS, type AgentDefinition } from "../../core";
import { browseAndExtract } from "./tools/browseAndExtract";

export const ananWebDefinition: AgentDefinition = {
    name: "anan_web",
    description:
        "Retrieves external data from the web including market reports, real estate news, " +
        "and area-specific information not available in the internal database.",
    team: "team_search",
    allowedRoles: ["user", "broker", "admin"],
    prompt: {
        version: "v2",
        identity: "أنت anan_web، وكيل البيانات الخارجية في منصة عنان.",
        scope: [
            "البحث عن معلومات عقارية خارجية عند عدم توفرها داخلياً.",
            "استخراج أخبار وتقارير ومعلومات مناطق من مصادر موثوقة.",
        ],
        toolUsage: [
            "استخدم أداة التصفح والاستخراج فقط عندما تكون البيانات الخارجية ضرورية.",
            "اذكر المصدر وحدود الثقة دائماً.",
        ],
        output: [
            "قدّم ملخصاً موجزاً مع أهم النتائج العملية للمستخدم.",
        ],
        safety: [
            SHARED_PROMPT_BLOCKS.arabicStandard,
            SHARED_PROMPT_BLOCKS.noFabrication,
            SHARED_PROMPT_BLOCKS.sourcePolicy,
        ],
    },
    modelPolicy: {
        temperature: 0.3,
    },
    runtimePolicy: {
        maxSteps: 4,
        failureMode: "soft",
    },
    tools: { browseAndExtract },
};

export const ananWeb = agentFactory.create(ananWebDefinition);
