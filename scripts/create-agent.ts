/**
 * WHY:   Adding a new agent by hand recreates boilerplate and drifts from architecture rules.
 * WHAT:  Generates a starter agent config, prompt, README, and tool folder from shared templates.
 * HOW:   Call `bun run scripts/create-agent.ts <team> <agent_name>`.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const [, , team, agentName] = process.argv;

if (!team || !agentName) {
  console.error("Usage: bun run scripts/create-agent.ts <team> <agent_name>");
  process.exit(1);
}

const root = process.cwd();
const teamDir = join(root, "convex", "ai_zone", "agents", team, agentName);
const promptFile = join(teamDir, "prompt.ts");
const configFile = join(teamDir, "config.ts");
const readmeFile = join(teamDir, "README.md");
const toolsDir = join(root, "convex", "ai_zone", "agents", team, "tools");

mkdirSync(teamDir, { recursive: true });
mkdirSync(toolsDir, { recursive: true });

if (!existsSync(promptFile)) {
  writeFileSync(
    promptFile,
    `import { SHARED_PROMPT_BLOCKS, type PromptDefinition } from "../../core";\n\nexport const ${toIdentifier(agentName)}Prompt: PromptDefinition = {\n  version: "v1",\n  identity: "You are ${agentName} for Anan.",\n  scope: ["Describe the business scope here."],\n  toolUsage: ["Use only the tools explicitly registered for this agent."],\n  output: ["Respond clearly and keep the result action-oriented."],\n  safety: [SHARED_PROMPT_BLOCKS.arabicStandard, SHARED_PROMPT_BLOCKS.noFabrication, SHARED_PROMPT_BLOCKS.businessPolicy],\n};\n`,
  );
}

if (!existsSync(configFile)) {
  writeFileSync(
    configFile,
    `import type { AgentDefinition } from "../../core";\nimport { ${toIdentifier(agentName)}Prompt } from "./prompt";\n\nexport const ${toIdentifier(agentName)}Definition: AgentDefinition = {\n  name: "${agentName}",\n  description: "Describe what this agent does.",\n  team: "${team}",\n  allowedRoles: ["user", "broker", "RED", "admin"],\n  prompt: ${toIdentifier(agentName)}Prompt,\n  modelPolicy: { temperature: 0.2 },\n  runtimePolicy: { maxSteps: 3, failureMode: "soft" },\n  tools: {},\n};\n`,
  );
}

if (!existsSync(readmeFile)) {
  writeFileSync(
    readmeFile,
    `# ${agentName}\n\n## Purpose\nDescribe the agent, the tools it owns, and any team-level expectations.\n`,
  );
}

function toIdentifier(value: string) {
  return value
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[^a-zA-Z]+/, "");
}
