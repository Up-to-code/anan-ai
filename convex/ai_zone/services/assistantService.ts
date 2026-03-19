/**
 * assistantService.ts — AI Zone Service Layer
 *
 * All complex DB logic, identity resolution, and orchestration for the
 * AI assistant live here. The root controller (assistant.ts) stays thin.
 */
import type { QueryCtx, ActionCtx, MutationCtx } from "../../_generated/server";
import type { Id, Doc } from "../../_generated/dataModel";
import { ConvexError } from "convex/values";
import { orchestrate } from "../agents/anan";
import { orchestrate as orchestrateWorkspace } from "../agents/anan_workspace";
import type {
    WorkspaceProjectFieldKey,
    WorkspaceProjectActionCandidate,
    WorkspaceStructuredOutput,
    WorkspaceStreamPhase,
    WorkspaceStreamStatus,
} from "../agents/anan_workspace/types";
import { apiRefs, internalRefs } from "../../shared_logic/lib/generatedApiRefs";
import {
    findProfileForResolvedIdentity,
    requireResolvedIdentity,
} from "../../_core/security/identity";
import { resolveWorkspaceAgUiTurn } from "./agUi";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AssistantOwner = {
    userId: string;
    ownerType: "broker" | "RED" | "user";
    ownerBrokerId?: Id<"brokers">;
    ownerREDId?: Id<"RED">;
};

type AssistantKind = "default" | "anan_workspace" | "anan_pro";
type ThreadScope = "user" | "organization";

type WorkspaceProjectFields = {
    name?: string;
    city?: string;
    district?: string;
    price?: number;
    rooms?: number;
    bathrooms?: number;
    description?: string;
};

type WorkspaceProjectActionState = WorkspaceProjectActionCandidate & {
    type: "create_project";
    fields: WorkspaceProjectFields;
    projectId?: string;
    error?: string;
};

const WORKSPACE_KINDS: AssistantKind[] = ["anan_workspace", "anan_pro"];

const PROJECT_REQUIRED_FIELDS: WorkspaceProjectFieldKey[] = [
    "name",
    "city",
    "district",
    "price",
    "rooms",
    "bathrooms",
    "description",
];

const FIELD_QUESTION_MAP: Record<WorkspaceProjectFieldKey, string> = {
    name: "ما اسم المشروع؟",
    city: "ما المدينة؟",
    district: "ما الحي أو المنطقة؟",
    price: "ما السعر المستهدف للمشروع؟",
    rooms: "كم عدد الغرف؟",
    bathrooms: "كم عدد الحمامات؟",
    description: "اكتب وصفاً مختصراً للمشروع.",
};

// ─── Identity Resolution ──────────────────────────────────────────────────────
type ReadCtx = QueryCtx | MutationCtx;

/**
 * Resolves the current user's identity and determines their owner type
 * (broker, RED, or standard user) from their profile.
 */
export async function resolveAssistantOwner(ctx: ReadCtx): Promise<AssistantOwner> {
    const identity = await requireResolvedIdentity(ctx);
    const profile = await findProfileForResolvedIdentity(ctx, identity);

    if (profile?.isActive === false) {
        throw new ConvexError({ code: "ACCOUNT_INACTIVE", message: "Account is deactivated" });
    }

    if (profile?.brokerId) {
        return { userId: identity.authUserId, ownerType: "broker", ownerBrokerId: profile.brokerId };
    }
    if (profile?.REDId) {
        return { userId: identity.authUserId, ownerType: "RED", ownerREDId: profile.REDId };
    }
    return { userId: identity.authUserId, ownerType: "user" };
}

/**
 * Safe version that returns null instead of throwing when unauthenticated.
 */
export async function resolveAssistantOwnerSafe(ctx: ReadCtx): Promise<AssistantOwner | null> {
    try {
        return await resolveAssistantOwner(ctx);
    } catch {
        return null;
    }
}

function normalizeOwner(ownerOrUser: string | AssistantOwner): AssistantOwner {
    if (typeof ownerOrUser === "string") {
        return { userId: ownerOrUser, ownerType: "user" };
    }
    return ownerOrUser;
}

function isWorkspaceKind(kind?: AssistantKind): boolean {
    return kind === "anan_workspace" || kind === "anan_pro";
}

function matchesAssistantKind(
    thread: Doc<"assistantThreads">,
    assistantKind?: AssistantKind,
): boolean {
    if (!assistantKind) return true;

    const kind = (thread.assistantKind ?? "default") as AssistantKind;
    if (assistantKind === "anan_workspace") {
        return WORKSPACE_KINDS.includes(kind);
    }
    return kind === assistantKind;
}

function getThreadScope(thread: Doc<"assistantThreads">): ThreadScope {
    return (thread as { scope?: ThreadScope }).scope === "organization" ? "organization" : "user";
}

function canAccessThread(
    thread: Doc<"assistantThreads">,
    owner: AssistantOwner,
    assistantKind?: AssistantKind,
): boolean {
    if (!matchesAssistantKind(thread, assistantKind)) return false;

    const scope = getThreadScope(thread);
    if (scope === "organization" && isWorkspaceKind(assistantKind)) {
        if (owner.ownerType === "broker") {
            return Boolean(owner.ownerBrokerId && thread.ownerBrokerId && String(owner.ownerBrokerId) === String(thread.ownerBrokerId));
        }
        if (owner.ownerType === "RED") {
            return Boolean(owner.ownerREDId && thread.ownerREDId && String(owner.ownerREDId) === String(thread.ownerREDId));
        }
        return false;
    }

    return thread.userId === owner.userId;
}

async function collectAccessibleThreads(
    ctx: QueryCtx,
    owner: AssistantOwner,
    assistantKind?: AssistantKind,
): Promise<Doc<"assistantThreads">[]> {
    const threads: Doc<"assistantThreads">[] = [];

    const userThreads = await ctx.db
        .query("assistantThreads")
        .withIndex("userId", (q: any) => q.eq("userId", owner.userId))
        .collect();
    threads.push(...userThreads);

    if (isWorkspaceKind(assistantKind)) {
        if (owner.ownerType === "broker" && owner.ownerBrokerId) {
            const brokerThreads = await ctx.db
                .query("assistantThreads")
                .withIndex("ownerBrokerId", (q: any) => q.eq("ownerBrokerId", owner.ownerBrokerId))
                .collect();
            threads.push(...brokerThreads);
        }

        if (owner.ownerType === "RED" && owner.ownerREDId) {
            const redThreads = await ctx.db
                .query("assistantThreads")
                .withIndex("ownerREDId", (q: any) => q.eq("ownerREDId", owner.ownerREDId))
                .collect();
            threads.push(...redThreads);
        }
    }

    const deduped: Doc<"assistantThreads">[] = [];
    const seen = new Set<string>();
    for (const thread of threads) {
        const id = String(thread._id);
        if (seen.has(id)) continue;
        seen.add(id);
        if (canAccessThread(thread, owner, assistantKind)) {
            deduped.push(thread);
        }
    }

    return deduped.sort((a, b) => b.updatedAt - a.updatedAt);
}

// ─── Thread Operations ────────────────────────────────────────────────────────
/**
 * Fetches the most recent assistant thread for a given owner context.
 */
export async function getLatestThread(
    ctx: QueryCtx,
    ownerOrUser: string | AssistantOwner,
    assistantKind?: AssistantKind,
): Promise<Doc<"assistantThreads"> | null> {
    const owner = normalizeOwner(ownerOrUser);
    const threads = await collectAccessibleThreads(ctx, owner, assistantKind);
    if (threads.length === 0) return null;

    if (isWorkspaceKind(assistantKind)) {
        const latestOrganizationThread = threads.find((thread) => getThreadScope(thread) === "organization");
        if (latestOrganizationThread) {
            return latestOrganizationThread;
        }
    }

    return threads[0] ?? null;
}

/**
 * Returns recent assistant threads for the current owner context and assistant kind.
 */
export async function listRecentThreads(
    ctx: QueryCtx,
    ownerOrUser: string | AssistantOwner,
    assistantKind?: AssistantKind,
    limit = 6,
) {
    const owner = normalizeOwner(ownerOrUser);
    const threads = await collectAccessibleThreads(ctx, owner, assistantKind);

    if (!isWorkspaceKind(assistantKind)) {
        return threads.slice(0, limit);
    }

    const organizationThreads = threads.filter((thread) => getThreadScope(thread) === "organization");
    const legacyUserThreads = threads.filter((thread) => getThreadScope(thread) !== "organization");
    return [...organizationThreads, ...legacyUserThreads].slice(0, limit);
}

// ─── Message Operations ───────────────────────────────────────────────────────
/**
 * Lists all messages for a thread, verifying ownership first.
 */
export async function listThreadMessages(
    ctx: QueryCtx,
    owner: AssistantOwner,
    threadId?: Id<"assistantThreads">,
    assistantKind?: AssistantKind,
) {
    const thread = threadId
        ? await ctx.db.get(threadId)
        : await getLatestThread(ctx, owner, assistantKind);
    if (!thread || !canAccessThread(thread, owner, assistantKind)) return [];

    const messages = await ctx.db
        .query("assistantMessages")
        .withIndex("threadId", (q) => q.eq("threadId", thread._id))
        .collect();

    return messages.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Internal helper to fetch a specific message content by ID.
 * Used by durable workflows which only receive the message ID.
 */
export async function getMessageContent(
    ctx: QueryCtx,
    messageId: Id<"assistantMessages">
): Promise<Doc<"assistantMessages"> | null> {
    return ctx.db.get(messageId);
}

function normalizeArabicDigits(input: string): string {
    const digitMap: Record<string, string> = {
        "٠": "0",
        "١": "1",
        "٢": "2",
        "٣": "3",
        "٤": "4",
        "٥": "5",
        "٦": "6",
        "٧": "7",
        "٨": "8",
        "٩": "9",
    };

    return input
        .split("")
        .map((ch) => digitMap[ch] ?? ch)
        .join("");
}

function parseFirstNumber(input: string): number | null {
    const normalized = normalizeArabicDigits(input);
    const match = normalized.match(/\d[\d,.]*/);
    if (!match) return null;
    const parsed = Number(match[0].replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
}

function parsePrice(input: string): number | null {
    const normalized = normalizeArabicDigits(input);
    const million = normalized.match(/(\d+(?:\.\d+)?)\s*مليون/i);
    if (million) {
        const value = Number(million[1]);
        return Number.isFinite(value) ? Math.round(value * 1_000_000) : null;
    }

    const thousand = normalized.match(/(\d+(?:\.\d+)?)\s*الف/i);
    if (thousand) {
        const value = Number(thousand[1]);
        return Number.isFinite(value) ? Math.round(value * 1_000) : null;
    }

    return parseFirstNumber(normalized);
}

function parseSimpleFieldValue(message: string, key: WorkspaceProjectFieldKey): string | number | undefined {
    const text = message.trim();
    if (!text) return undefined;

    if (key === "price") {
        return parsePrice(text) ?? undefined;
    }

    if (key === "rooms" || key === "bathrooms") {
        return parseFirstNumber(text) ?? undefined;
    }

    return text;
}

function extractProjectFieldsFromText(
    message: string,
    expectedField?: WorkspaceProjectFieldKey,
): WorkspaceProjectFields {
    const text = normalizeArabicDigits(message);
    const next: WorkspaceProjectFields = {};

    const nameMatch = text.match(/(?:اسم\s*المشروع|المشروع)\s*[:\-]?\s*([^\n،.]+)/i);
    if (nameMatch?.[1]) next.name = nameMatch[1].trim();

    const cityMatch = text.match(/(?:المدينة|مدينة)\s*[:\-]?\s*([^\n،.]+)/i);
    if (cityMatch?.[1]) next.city = cityMatch[1].trim();

    const districtMatch = text.match(/(?:الحي|المنطقة)\s*[:\-]?\s*([^\n،.]+)/i);
    if (districtMatch?.[1]) next.district = districtMatch[1].trim();

    const price = parsePrice(text);
    if (price !== null) next.price = price;

    const roomsMatch = text.match(/(\d+)\s*(?:غرف|غرفة|rooms?|bedrooms?)/i);
    if (roomsMatch?.[1]) next.rooms = Number(roomsMatch[1]);

    const bathsMatch = text.match(/(\d+)\s*(?:حمام|حمامات|baths?|bathrooms?)/i);
    if (bathsMatch?.[1]) next.bathrooms = Number(bathsMatch[1]);

    const descriptionMatch = text.match(/(?:الوصف|وصف)\s*[:\-]?\s*(.+)$/i);
    if (descriptionMatch?.[1]) next.description = descriptionMatch[1].trim();

    if (expectedField && next[expectedField] === undefined) {
        const value = parseSimpleFieldValue(text, expectedField);
        if (value !== undefined) {
            (next as Record<string, unknown>)[expectedField] = value;
        }
    }

    return next;
}

function computeMissingFields(fields: WorkspaceProjectFields): WorkspaceProjectFieldKey[] {
    return PROJECT_REQUIRED_FIELDS.filter((field) => {
        const value = fields[field];
        if (typeof value === "number") return !Number.isFinite(value);
        return typeof value !== "string" || value.trim().length === 0;
    });
}

function hasCreateProjectIntent(message: string, structured?: WorkspaceStructuredOutput): boolean {
    const normalized = message.toLowerCase();
    if (structured?.actionCandidate?.type === "create_project") return true;
    return /(?:إنشاء|انشاء|اضف|أضف|ابدأ|ابدء|أنشئ).{0,12}(?:مشروع|عقار)/.test(message) ||
        normalized.includes("create project") ||
        normalized.includes("new project");
}

function buildProjectQuestions(missingFields: WorkspaceProjectFieldKey[]): string[] {
    return missingFields.map((field) => FIELD_QUESTION_MAP[field]);
}

function normalizeWorkspaceStructuredOutput(value: unknown): WorkspaceStructuredOutput {
    if (!value || typeof value !== "object") {
        return { questions: [] };
    }

    const candidate = value as {
        questions?: unknown;
        actionCandidate?: unknown;
    };

    const questions = Array.isArray(candidate.questions)
        ? candidate.questions.filter((item): item is string => typeof item === "string").slice(0, 8)
        : [];

    const actionCandidate = candidate.actionCandidate;
    if (!actionCandidate || typeof actionCandidate !== "object") {
        return { questions };
    }

    const action = actionCandidate as {
        type?: unknown;
        fields?: unknown;
        missingFields?: unknown;
        state?: unknown;
    };

    if (action.type !== "create_project") {
        return { questions };
    }

    const normalizedCandidate: WorkspaceProjectActionCandidate = {
        type: "create_project",
        fields: typeof action.fields === "object" && action.fields ? action.fields as any : {},
        missingFields: Array.isArray(action.missingFields)
            ? action.missingFields.filter((field): field is WorkspaceProjectFieldKey =>
                PROJECT_REQUIRED_FIELDS.includes(field as WorkspaceProjectFieldKey))
            : [...PROJECT_REQUIRED_FIELDS],
        state: action.state === "ready" || action.state === "completed" || action.state === "failed"
            ? action.state
            : "collecting",
    };

    return {
        questions,
        actionCandidate: normalizedCandidate,
    };
}

function getLatestWorkspaceActionState(
    messages: Array<Doc<"assistantMessages">>,
): WorkspaceProjectActionState | null {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        const message = messages[i];
        if (message.role !== "assistant") continue;

        const metadata = (message.metadata ?? {}) as {
            workspaceActionState?: WorkspaceProjectActionState;
            meta?: { workspaceActionState?: WorkspaceProjectActionState };
        };
        const state = metadata.workspaceActionState ?? metadata.meta?.workspaceActionState;
        if (state?.type === "create_project") {
            return state;
        }
    }

    return null;
}

function buildRecentThreadContext(messages: Array<Doc<"assistantMessages">>, limit = 6): string {
    if (messages.length === 0) return "";

    const recent = messages.slice(-limit);
    const lines = recent.map((message) => {
        const roleLabel = message.role === "user" ? "User" : "Assistant";
        return `- ${roleLabel}: ${message.content.slice(0, 240)}`;
    });

    return `[Recent Thread Context]\n${lines.join("\n")}`;
}

function resolveWorkspaceProjectActionState(params: {
    message: string;
    previous: WorkspaceProjectActionState | null;
    structured: WorkspaceStructuredOutput;
}): WorkspaceProjectActionState | null {
    const { message, previous, structured } = params;

    const hasIntent = hasCreateProjectIntent(message, structured);
    const isContinuing = previous !== null && previous.state !== "completed";
    if (!hasIntent && !isContinuing) {
        return null;
    }

    const mergedFields: WorkspaceProjectFields = {
        ...(previous?.fields ?? {}),
    };

    if (structured.actionCandidate?.type === "create_project") {
        const candidateFields = structured.actionCandidate.fields as WorkspaceProjectFields;
        Object.assign(mergedFields, candidateFields);
    }

    const expectedField = previous?.missingFields?.[0];
    const parsedFields = extractProjectFieldsFromText(message, expectedField);
    Object.assign(mergedFields, parsedFields);

    const missingFields = computeMissingFields(mergedFields);
    const state: WorkspaceProjectActionState["state"] = missingFields.length === 0 ? "ready" : "collecting";

    return {
        type: "create_project",
        fields: mergedFields,
        missingFields,
        state,
    };
}

function projectFieldsToCreatePayload(fields: WorkspaceProjectFields) {
    const missing = computeMissingFields(fields);
    if (missing.length > 0) return null;

    const address = [fields.district, fields.city].filter(Boolean).join(" - ");
    return {
        title: fields.name as string,
        address: address || (fields.city as string),
        price: fields.price as number,
        beds: fields.rooms as number,
        baths: fields.bathrooms as number,
        description: fields.description as string,
        location: fields.city,
        area: fields.district,
        status: "available" as const,
    };
}

async function autoCreateWorkspaceProjectDraft(
    ctx: ActionCtx,
    owner: AssistantOwner,
    fields: WorkspaceProjectFields,
): Promise<{ projectId: string }> {
    const payload = projectFieldsToCreatePayload(fields);
    if (!payload) {
        throw new Error("PROJECT_FIELDS_INCOMPLETE");
    }

    if (owner.ownerType === "broker" && owner.ownerBrokerId) {
        const projectId = await ctx.runMutation(apiRefs["broker_zone/properties"].create, {
            brokerId: owner.ownerBrokerId,
            ...payload,
        });
        return { projectId: String(projectId) };
    }

    if (owner.ownerType === "RED" && owner.ownerREDId) {
        const projectId = await ctx.runMutation(apiRefs["red_zone/properties"].create, {
            REDId: owner.ownerREDId,
            ...payload,
        });
        return { projectId: String(projectId) };
    }

    throw new Error("PROJECT_CREATE_UNAVAILABLE");
}

function ensureUiTurn(turn: any, assistantText: string): any {
    if (turn) return turn;

    return {
        objective: "workspace_assistant",
        targetZone: "projects",
        action: {
            id: "latest_update",
            title: "تحديث المسار",
            zone: "projects",
            fields: [],
        },
        cards: [],
        assistantText,
    };
}

function appendUniqueCards(turn: any, cards: Array<Record<string, unknown>>) {
    const existing = new Set<string>((turn.cards ?? []).map((card: any) => String(card.id)));
    const merged = [...(turn.cards ?? [])];
    for (const card of cards) {
        const id = String(card.id ?? "");
        if (!id || existing.has(id)) continue;
        existing.add(id);
        merged.push(card);
    }
    turn.cards = merged;
}

function enrichUiTurnWithWorkspaceState(
    turn: any,
    assistantText: string,
    actionState: WorkspaceProjectActionState | null,
): any {
    const uiTurn = ensureUiTurn(turn, assistantText);
    uiTurn.assistantText = assistantText;

    if (!actionState) {
        return uiTurn;
    }

    if (actionState.state === "collecting") {
        appendUniqueCards(uiTurn, [
            {
                id: "workspace-missing-fields",
                componentId: "field_request_list",
                props: {
                    fields: actionState.missingFields.map((field) => FIELD_QUESTION_MAP[field]),
                },
            },
            {
                id: "workspace-followup",
                componentId: "missing_data_prompt",
                props: {
                    prompt: actionState.missingFields.length > 0
                        ? FIELD_QUESTION_MAP[actionState.missingFields[0]]
                        : "أرسل أي تفاصيل إضافية تريد إضافتها.",
                },
            },
        ]);
        return uiTurn;
    }

    if (actionState.state === "completed") {
        appendUniqueCards(uiTurn, [
            {
                id: "workspace-project-created",
                componentId: "execution_result",
                props: {
                    title: "تم إنشاء المشروع",
                    description: actionState.projectId
                        ? `تم إنشاء المشروع كمسودة بنجاح. رقم المشروع: ${actionState.projectId}`
                        : "تم إنشاء المشروع كمسودة بنجاح.",
                    status: "done",
                },
            },
        ]);
        return uiTurn;
    }

    if (actionState.state === "failed") {
        appendUniqueCards(uiTurn, [
            {
                id: "workspace-project-failed",
                componentId: "execution_result",
                props: {
                    title: "تعذر إنشاء المشروع",
                    description: actionState.error ?? "تعذر إنشاء المشروع حالياً. راجع البيانات وحاول مرة أخرى.",
                    status: "blocked",
                },
            },
        ]);
    }

    return uiTurn;
}

function appendQuestionsToAssistantText(
    text: string,
    questions: string[],
): string {
    if (questions.length === 0) return text;

    const firstQuestion = questions[0];
    if (firstQuestion && text.includes(firstQuestion)) {
        return text;
    }

    const numbered = questions.map((question, index) => `${index + 1}. ${question}`).join("\n");
    return `${text}\n\n${numbered}`;
}

// ─── Orchestration ────────────────────────────────────────────────────────────
/**
 * Core orchestration logic: resolves context, gathers knowledge,
 * runs the multi-agent orchestrator, and persists the conversation step.
 *
 * WHY:   This is where user messages enter the AI pipeline.
 * WHAT:  Resolves identity → fetches context → calls orchestrate() → saves result.
 * HOW:   Uses the anan orchestrator and registry-driven team dispatch,
 *        so there is no per-role custom orchestration builder.
 */
export async function handleAssistantMessage(
    ctx: ActionCtx,
    args: {
        message: string;
        threadId?: Id<"assistantThreads">;
        inputMode?: "text" | "voice";
        regenerate?: boolean;
        regenerateMessageId?: string;
        assistantKind?: AssistantKind;
        orchestratorName?: string;
        promptPrefix?: string;
        streamSessionId?: string;
    },
): Promise<{
    ok: true;
    threadId: string;
    mode: "qa" | "action";
    output: string;
    messageId: string;
}> {
    const isWorkspaceAssistant = isWorkspaceKind(args.assistantKind);
    let streamSeq = 0;

    // 1. Resolve thread & owner via query
    const { thread, owner } = await ctx.runQuery(
        (isWorkspaceAssistant
            ? apiRefs["ai_zone/assistantWorkspace"].getThread
            : apiRefs["ai_zone/assistant"].getThread),
        {},
    );

    let activeThreadId = (args.threadId ?? thread?._id) as Id<"assistantThreads"> | undefined;
    let streamedAssistantText = "";
    let emittedAnyDelta = false;

    const appendWorkspaceStreamEvent = async (
        event: {
            eventType: "stage" | "delta" | "assistant_meta" | "thread" | "lifecycle" | "error";
            phase?: WorkspaceStreamPhase;
            status?: WorkspaceStreamStatus | "cancelled";
            teamId?: string;
            agentName?: string;
            delta?: string;
            threadId?: Id<"assistantThreads">;
            title?: string;
            meta?: unknown;
            message?: string;
            code?: string;
            details?: Record<string, unknown>;
        },
    ) => {
        if (!isWorkspaceAssistant || !args.streamSessionId) return;
        if (event.eventType === "stage" && !event.phase) {
            console.error("[assistant_stream] invalid stage event", {
                sessionId: args.streamSessionId,
                seq: streamSeq + 1,
                eventType: event.eventType,
            });
            throw new ConvexError({
                code: "INVALID_ARGUMENT",
                message: "Stage stream event is missing phase.",
            });
        }
        if (event.eventType === "delta" && typeof event.delta !== "string") {
            console.error("[assistant_stream] invalid delta event", {
                sessionId: args.streamSessionId,
                seq: streamSeq + 1,
                eventType: event.eventType,
            });
            throw new ConvexError({
                code: "INVALID_ARGUMENT",
                message: "Delta stream event is missing delta.",
            });
        }

        streamSeq += 1;
        await ctx.runMutation(
            internalRefs["ai_zone/assistantWorkspace"]._appendStreamEvent,
            {
                sessionId: args.streamSessionId,
                seq: streamSeq,
                event: {
                    ...event,
                    timestamp: Date.now(),
                },
                userId: owner.userId,
                ownerType: owner.ownerType,
                ownerBrokerId: owner.ownerBrokerId,
                ownerREDId: owner.ownerREDId,
            },
        );

        if (event.eventType === "lifecycle" || event.eventType === "error") {
            console.info("[assistant_stream]", {
                sessionId: args.streamSessionId,
                seq: streamSeq,
                eventType: event.eventType,
                status: event.status ?? "n/a",
                phase: event.phase ?? "n/a",
                code: event.code ?? "n/a",
            });
        }
    };

    const emitWorkspaceStage = async (
        phase: WorkspaceStreamPhase,
        extra: {
            status?: WorkspaceStreamStatus;
            teamId?: string;
            agentName?: string;
            details?: Record<string, unknown>;
        } = {},
    ) => {
        await appendWorkspaceStreamEvent({
            eventType: "stage",
            phase,
            status: extra.status,
            teamId: extra.teamId,
            agentName: extra.agentName,
            details: extra.details,
        });
    };

    const emitWorkspaceDelta = async (delta: string) => {
        if (!delta) return;
        streamedAssistantText += delta;
        emittedAnyDelta = true;
        await appendWorkspaceStreamEvent({
            eventType: "delta",
            delta,
        });
    };

    const isWorkspaceStreamCancelled = async () => {
        if (!isWorkspaceAssistant || !args.streamSessionId) return false;
        const state = await ctx.runQuery(apiRefs["ai_zone/assistantWorkspace"].isStreamCancelled, {
            sessionId: args.streamSessionId,
        }) as { cancelled?: boolean } | null;
        return Boolean(state?.cancelled);
    };

    // 2. Get entitlement (determines qa vs action mode)
    const entitlement = await ctx.runQuery(
        apiRefs["shared_logic/subscriptions/index"].getAssistantEntitlement,
        {},
    );
    const mode = entitlement.mode;

    if (isWorkspaceAssistant && args.streamSessionId) {
        await appendWorkspaceStreamEvent({
            eventType: "lifecycle",
            status: "running",
            details: {
                streamSessionId: args.streamSessionId,
            },
        });
    }

    if (isWorkspaceAssistant && !activeThreadId) {
        const created = await ctx.runMutation(apiRefs["ai_zone/assistantWorkspace"].createThread, {
            title: args.message.slice(0, 80),
        });
        activeThreadId = created.threadId as Id<"assistantThreads">;
    }

    if (isWorkspaceAssistant && activeThreadId) {
        await appendWorkspaceStreamEvent({
            eventType: "thread",
            threadId: activeThreadId,
        });
    }

    const existingMessages = (isWorkspaceAssistant && activeThreadId)
        ? (await ctx.runQuery(apiRefs["ai_zone/assistantWorkspace"].listMessages, { threadId: activeThreadId })) as Array<Doc<"assistantMessages">>
        : [];
    const previousActionState = isWorkspaceAssistant
        ? getLatestWorkspaceActionState(existingMessages)
        : null;

    const regenerateSource = args.regenerate
        ? (args.regenerateMessageId
            ? existingMessages.find((message) => String(message._id) === args.regenerateMessageId && message.role === "user")
            : [...existingMessages].reverse().find((message) => message.role === "user"))
        : null;
    const effectiveUserMessage = regenerateSource?.content ?? args.message;

    // 3. Retrieve company knowledge for context
    const knowledge = await ctx.runQuery(
        apiRefs["shared_logic/knowledge/index"].retrieveCompanyKnowledge,
        { query: effectiveUserMessage, limit: 3 },
    );

    const knowledgeContext =
        knowledge.length > 0
            ? `\n\n[Company Knowledge]\n${knowledge
                .map(
                    (k: { title: string; category?: string | null; excerpt: string }) =>
                        `- ${k.title}${k.category ? ` (${k.category})` : ""}: ${k.excerpt}`,
                )
                .join("\n")}`
            : "";

    const recentContext = isWorkspaceAssistant
        ? buildRecentThreadContext(existingMessages)
        : "";

    const actionContext = (isWorkspaceAssistant && previousActionState)
        ? `[Open Action]\n${JSON.stringify({
            type: previousActionState.type,
            fields: previousActionState.fields,
            missingFields: previousActionState.missingFields,
            state: previousActionState.state,
        })}`
        : "";

    const workspaceContextBlock = [recentContext, actionContext]
        .filter((block) => block.length > 0)
        .join("\n\n");

    // 4. Build the prompt based on mode
    const basePrompt =
        mode === "qa"
            ? `${args.promptPrefix ? `${args.promptPrefix}\n\n` : ""}${effectiveUserMessage}\n\n[Policy: QA-only mode. Answer questions only. Do not execute actions.]${knowledgeContext}${workspaceContextBlock ? `\n\n${workspaceContextBlock}` : ""}`
            : `${args.promptPrefix ? `${args.promptPrefix}\n\n` : ""}${effectiveUserMessage}${knowledgeContext}${workspaceContextBlock ? `\n\n${workspaceContextBlock}` : ""}`;

    // 5. Map ownerType to orchestrator role
    const roleMap: Record<string, "user" | "broker" | "RED" | "admin"> = {
        broker: "broker",
        RED: "RED",
        user: "user",
    };

    // 6. Run the multi-agent orchestrator
    const result = (isWorkspaceAssistant
        ? await orchestrateWorkspace({
            ctx,
            prompt: basePrompt,
            role: roleMap[owner.ownerType] ?? "user",
            userId: owner.userId,
            threadId: activeThreadId as string | undefined,
            ragContext: knowledgeContext || undefined,
            channel: "app",
            streamSessionId: args.streamSessionId,
            onStageEvent: (event) =>
                emitWorkspaceStage(event.phase, {
                    status: event.status,
                    teamId: event.teamId,
                    agentName: event.agentName,
                    details: event.details,
                }),
            onTextDelta: emitWorkspaceDelta,
            onStreamCancelledCheck: isWorkspaceStreamCancelled,
        })
        : await orchestrate({
            ctx,
            prompt: basePrompt,
            role: roleMap[owner.ownerType] ?? "user",
            userId: owner.userId,
            threadId: activeThreadId as string | undefined,
            ragContext: knowledgeContext || undefined,
            channel: "app",
        }));

    let assistantText = result.output;
    const wasCancelled = Boolean((result as { cancelled?: boolean }).cancelled);

    const structuredOutput = isWorkspaceAssistant
        ? normalizeWorkspaceStructuredOutput((result as { structured?: WorkspaceStructuredOutput }).structured)
        : { questions: [] };

    let workspaceActionState: WorkspaceProjectActionState | null = isWorkspaceAssistant
        ? resolveWorkspaceProjectActionState({
            message: effectiveUserMessage,
            previous: previousActionState,
            structured: structuredOutput,
        })
        : null;

    if (workspaceActionState?.state === "ready" && !wasCancelled) {
        try {
            await emitWorkspaceStage("action_started", {
                status: "running",
                details: {
                    action: "create_project_draft",
                },
            });
            const created = await autoCreateWorkspaceProjectDraft(ctx, owner, workspaceActionState.fields);
            workspaceActionState = {
                ...workspaceActionState,
                state: "completed",
                missingFields: [],
                projectId: created.projectId,
            };
            assistantText = `${assistantText}\n\nتم إنشاء المشروع كمسودة بنجاح. رقم المشروع: ${created.projectId}.`;
            await emitWorkspaceStage("action_done", {
                status: "completed",
                details: {
                    action: "create_project_draft",
                    projectId: created.projectId,
                },
            });
        } catch (error) {
            workspaceActionState = {
                ...workspaceActionState,
                state: "failed",
                error: error instanceof Error ? error.message : "تعذر إنشاء المشروع حالياً.",
            };
            assistantText = `${assistantText}\n\nتعذر إنشاء المشروع حالياً. راجع البيانات وأرسل التحديث المطلوب.`;
            await emitWorkspaceStage("action_done", {
                status: "failed",
                details: {
                    action: "create_project_draft",
                    error: error instanceof Error ? error.message : "PROJECT_CREATE_FAILED",
                },
            });
        }
    }

    if (workspaceActionState?.state === "collecting" && !wasCancelled) {
        const actionQuestions = buildProjectQuestions(workspaceActionState.missingFields);
        assistantText = appendQuestionsToAssistantText(assistantText, actionQuestions);
        structuredOutput.questions = actionQuestions;
    }

    if (wasCancelled) {
        structuredOutput.questions = [];
        if (!assistantText.trim()) {
            assistantText = "تم إيقاف التوليد بناءً على طلبك.";
        } else {
            assistantText = `${assistantText}\n\nتم إيقاف التوليد بناءً على طلبك.`;
        }
    }

    if (isWorkspaceAssistant && args.streamSessionId) {
        if (!emittedAnyDelta && assistantText) {
            await emitWorkspaceDelta(assistantText);
        } else if (assistantText.startsWith(streamedAssistantText)) {
            const suffix = assistantText.slice(streamedAssistantText.length);
            if (suffix) {
                await emitWorkspaceDelta(suffix);
            }
        } else if (assistantText !== streamedAssistantText) {
            await emitWorkspaceDelta(assistantText);
        }
    }

    let assistantUiTurn = isWorkspaceAssistant
        ? resolveWorkspaceAgUiTurn(effectiveUserMessage, assistantText)
        : null;

    if (isWorkspaceAssistant) {
        assistantUiTurn = enrichUiTurnWithWorkspaceState(assistantUiTurn, assistantText, workspaceActionState);
    }

    const assistantMetadata = (() => {
        if (!isWorkspaceAssistant) {
            return assistantUiTurn ? { uiTurn: assistantUiTurn } : undefined;
        }

        const questions = structuredOutput.questions;
        const actionCandidate = workspaceActionState ?? structuredOutput.actionCandidate;
        return {
            uiTurn: assistantUiTurn,
            meta: {
                questions,
                actionCandidate,
                workspaceActionState,
            },
            workspaceActionState,
        };
    })();

    if (isWorkspaceAssistant && args.streamSessionId && assistantMetadata && "meta" in assistantMetadata) {
        await appendWorkspaceStreamEvent({
            eventType: "assistant_meta",
            meta: assistantMetadata.meta,
        });
    }

    const saveConversationStepMutation =
        isWorkspaceAssistant
            ? internalRefs["ai_zone/assistantWorkspace"]._saveConversationStep
            : internalRefs["ai_zone/assistant"]._saveConversationStep;

    // 7. Persist the conversation step
    await emitWorkspaceStage("persist_started", { status: "running" });
    const saved = await ctx.runMutation(
        saveConversationStepMutation,
        {
            threadId: activeThreadId,
            userId: owner.userId,
            ownerType: owner.ownerType,
            ownerBrokerId: owner.ownerBrokerId,
            ownerREDId: owner.ownerREDId,
            userMessage: effectiveUserMessage,
            userMessageMetadata: args.inputMode ? { inputMode: args.inputMode } : undefined,
            persistUserMessage: !(args.regenerate && regenerateSource),
            assistantMessage: assistantText,
            assistantMetadata,
            mode,
        },
    );
    await emitWorkspaceStage("persist_done", {
        status: "completed",
        details: {
            threadId: String(saved.threadId),
        },
    });
    if (isWorkspaceAssistant && args.streamSessionId) {
        await appendWorkspaceStreamEvent({
            eventType: "lifecycle",
            status: wasCancelled ? "cancelled" : "completed",
            threadId: saved.threadId,
            details: {
                messageId: String(saved.assistantMessageId),
            },
        });
    }

    return {
        ok: true,
        threadId: saved.threadId,
        mode,
        output: assistantText,
        messageId: saved.assistantMessageId,
    };
}

function resolveThreadScope(args: {
    ownerType: "broker" | "RED" | "user";
    assistantKind?: AssistantKind;
}): ThreadScope {
    if (isWorkspaceKind(args.assistantKind) && (args.ownerType === "broker" || args.ownerType === "RED")) {
        return "organization";
    }
    return "user";
}

// ─── Persistence ──────────────────────────────────────────────────────────────
/**
 * Persists a conversation step: creates a thread if needed,
 * saves both user and assistant messages, and updates the thread timestamp.
 */
export async function saveConversationStep(
    ctx: any, // MutationCtx
    args: {
        threadId?: Id<"assistantThreads">;
        userId: string;
        ownerType: "broker" | "RED" | "user";
        ownerBrokerId?: Id<"brokers">;
        ownerREDId?: Id<"RED">;
        userMessage: string;
        userMessageMetadata?: Record<string, unknown>;
        persistUserMessage?: boolean;
        assistantMessage: string;
        assistantMetadata?: Record<string, unknown>;
        mode: "qa" | "action";
        assistantKind?: AssistantKind;
        orchestratorName?: string;
    },
) {
    const now = Date.now();
    const shouldPersistUserMessage = args.persistUserMessage ?? true;

    const threadId =
        args.threadId ??
        (await ctx.db.insert("assistantThreads", {
            userId: args.userId,
            scope: resolveThreadScope({ ownerType: args.ownerType, assistantKind: args.assistantKind }),
            ownerType: args.ownerType,
            ownerBrokerId: args.ownerBrokerId,
            ownerREDId: args.ownerREDId,
            mode: args.mode,
            assistantKind: args.assistantKind ?? "default",
            orchestratorName: args.orchestratorName,
            title: args.userMessage.slice(0, 80),
            createdAt: now,
            updatedAt: now,
        }));

    const userMessageId = shouldPersistUserMessage
        ? await ctx.db.insert("assistantMessages", {
            threadId,
            role: "user",
            content: args.userMessage,
            mode: args.mode,
            metadata: args.userMessageMetadata,
            createdAt: now,
        })
        : null;

    const assistantMessageId = await ctx.db.insert("assistantMessages", {
        threadId,
        role: "assistant",
        content: args.assistantMessage,
        mode: args.mode,
        metadata: args.assistantMetadata,
        createdAt: now + 1,
    });

    await ctx.db.patch(threadId, {
        updatedAt: now,
        mode: args.mode,
        assistantKind: args.assistantKind ?? "default",
        orchestratorName: args.orchestratorName,
    });

    return { threadId, userMessageId, assistantMessageId };
}

/**
 * Creates an empty assistant thread so the UI can start from a durable thread id
 * before the first message is sent.
 */
export async function createAssistantThread(
    ctx: MutationCtx,
    args: {
        owner: AssistantOwner;
        mode?: "qa" | "action";
        assistantKind?: AssistantKind;
        orchestratorName?: string;
        title?: string;
    },
) {
    const now = Date.now();
    const mode = args.mode ?? "qa";
    const assistantKind = args.assistantKind ?? "default";

    const threadId = await ctx.db.insert("assistantThreads", {
        userId: args.owner.userId,
        scope: resolveThreadScope({
            ownerType: args.owner.ownerType,
            assistantKind,
        }),
        ownerType: args.owner.ownerType,
        ownerBrokerId: args.owner.ownerBrokerId,
        ownerREDId: args.owner.ownerREDId,
        mode,
        assistantKind,
        orchestratorName: args.orchestratorName,
        title: args.title,
        createdAt: now,
        updatedAt: now,
    });

    return { threadId };
}
