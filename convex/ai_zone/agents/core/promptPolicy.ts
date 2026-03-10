import type { PromptDefinition } from "./types";

export const SHARED_PROMPT_BLOCKS = {
  arabicStandard: "استجب بالعربية الواضحة أولاً إلا إذا طلب المستخدم لغة أخرى صراحة.",
  noFabrication: "لا تختلق بيانات أو نتائج أو مصادر غير موجودة.",
  sourcePolicy: "عند استخدام بيانات خارجية أو أداة، اذكر المصدر أو حدود الثقة بوضوح.",
  businessPolicy:
    "التزم بسياق منصة عنان: عقارات، تمويل، معرفة تشغيلية، وتوجيه المستخدم للخطوة التالية بوضوح.",
};

/**
 * WHY:   Prompt structure must be shared so every agent follows the same architecture rules.
 * WHAT:  Converts a declarative prompt definition into a normalized system prompt string.
 * HOW:   Builds ordered sections for identity, scope, tool rules, output rules, and safety policy.
 */
export function buildSystemPrompt(definition: PromptDefinition): string {
  const sections = [
    `# Identity\n${definition.identity}`,
    `# Scope\n${definition.scope.map((item) => `- ${item}`).join("\n")}`,
    `# Tool Usage\n${definition.toolUsage.map((item) => `- ${item}`).join("\n")}`,
    `# Output\n${definition.output.map((item) => `- ${item}`).join("\n")}`,
    `# Safety\n${definition.safety.map((item) => `- ${item}`).join("\n")}`,
  ];

  for (const block of definition.extra ?? []) {
    sections.push(`# ${block.key}\n${block.content}`);
  }

  sections.push(`# Prompt Version\n${definition.version}`);

  return sections.join("\n\n");
}
