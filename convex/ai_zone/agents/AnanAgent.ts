import { BaseConfiguredAgent } from "./core/BaseConfiguredAgent";
import type { AgentDefinition } from "./core/types";
import { composeToolMap } from "./core/toolRegistry";
import type { ToolFactoryMap } from "./types";

export interface AnanAgentConfig {
    name: string;
    description: string;
    team?: string;
    allowedRoles?: Array<"user" | "broker" | "RED" | "admin">;
    modelOverride?: string;
    maxSteps?: number;
    temperature?: number;
    tools: ToolFactoryMap;
    instructions: string;
    ragNamespace?: string;
    enableTokenTracking?: boolean;
    retryConfig?: unknown;
    promptVersion?: string;
}

export type AnanAgentResult = Awaited<ReturnType<AnanAgent["run"]>>;

/**
 * WHY:   Existing agent modules already instantiate `AnanAgent`; this wrapper keeps them compatible.
 * WHAT:  Adapts the legacy constructor shape into the new configurable core runtime.
 * HOW:   Converts the legacy instruction string into a structured prompt definition and delegates to `BaseConfiguredAgent`.
 */
export class AnanAgent extends BaseConfiguredAgent {
    public readonly config: AnanAgentConfig;

    constructor(config: AnanAgentConfig) {
        const definition: AgentDefinition = {
            name: config.name,
            description: config.description,
            team: config.team ?? "legacy",
            allowedRoles: config.allowedRoles ?? ["user", "broker", "RED", "admin"],
            prompt: {
                version: config.promptVersion ?? "legacy-v1",
                identity: config.instructions,
                scope: ["Follow the agent mission and stay inside the configured tool and role boundaries."],
                toolUsage: ["Use only the configured tools.", "Do not fabricate data when a tool returns no result."],
                output: ["Respond clearly and actionably."],
                safety: [
                    "Respond in Arabic first unless the user explicitly asks for another language.",
                    "Do not fabricate data or hidden tool results.",
                ],
            },
            modelPolicy: {
                modelOverride: config.modelOverride,
                temperature: config.temperature,
            },
            runtimePolicy: {
                maxSteps: config.maxSteps,
                enableTokenTracking: config.enableTokenTracking,
                retryConfig: config.retryConfig,
                failureMode: "soft",
            },
            tools: composeToolMap([], config.tools),
            ragNamespace: config.ragNamespace,
        };
        super(definition);
        this.config = config;
    }
}
