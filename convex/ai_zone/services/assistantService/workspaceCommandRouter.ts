import { api } from "../../../_generated/api";
import type { Id } from "../../../_generated/dataModel";
import type { ActionCtx } from "../../../_generated/server";
import type {
  WorkspaceDeleteProjectConfirmationState,
  WorkspaceListActionState,
  WorkspaceOperatorFilter,
  WorkspaceOperatorListItem,
} from "../../agents/anan_workspace/types";
import type { AgUiCardDefinition, AgUiConversationTurn } from "../agUi/types";
import type { AssistantOwner, WorkspaceActionState } from "./types";

type WorkspaceDirectCommandKind =
  | "list_clients"
  | "list_projects"
  | "search_projects"
  | "delete_project"
  | "list_offers"
  | "search_offers";

type WorkspaceDirectCommandResult = {
  assistantText: string;
  meta: Record<string, unknown>;
  uiTurn: AgUiConversationTurn | null;
  actionState: WorkspaceActionState | null;
};

type ParsedWorkspaceCommand =
  | { kind: "list_clients"; limit: number; todayOnly: boolean; stage?: DealStage; searchTerm?: string }
  | { kind: "list_projects" | "search_projects"; limit: number; searchTerm?: string }
  | { kind: "delete_project"; projectId?: string }
  | { kind: "list_offers" | "search_offers"; limit: number; searchTerm?: string };

type PaginatedPage<T> = {
  page: T[];
};

type ProjectSummary = {
  _id: string;
  title: string;
  address: string;
  price: number;
  status?: string;
  publicationState?: string;
  brokerId?: string;
  REDId?: string;
};

type DealStage = "new" | "contacted" | "negotiation" | "won" | "lost";

type DealSummary = {
  id: string;
  title: string;
  stage: DealStage;
  value?: number;
  contactName?: string;
  contactPhone?: string;
  nextFollowUpAt?: number;
};

type ClientSummary = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

type EnrichedClientSummary = ClientSummary & {
  matchedDeal?: DealSummary;
};

type OfferSummary = {
  id: string;
  price: number;
  status: string;
  publicationState?: string;
  visibility?: string;
  property?: {
    title?: string;
    address?: string;
  } | null;
  description?: string;
  message?: string;
};

const MAX_LIMIT = 30;
const DEFAULT_LIMIT = 10;
const YES_WORDS = ["نعم", "ايوه", "أيوه", "أكيد", "اكيد", "أكد", "تأكيد", "confirm", "yes", "delete it", "احذف الآن"];

function normalizeArabicDigits(input: string) {
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
    .map((char) => digitMap[char] ?? char)
    .join("");
}

function normalizeCommandText(input: string) {
  return normalizeArabicDigits(input).toLowerCase().replace(/\s+/g, " ").trim();
}

function includesAny(text: string, values: readonly string[]) {
  return values.some((value) => text.includes(value));
}

function extractLimit(text: string) {
  const match = text.match(/\b(\d{1,2})\b/);
  if (!match) return DEFAULT_LIMIT;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function extractQuotedTerm(message: string) {
  const quoted = message.match(/["'`“”](.+?)["'`“”]/);
  return quoted?.[1]?.trim();
}

function extractSearchTerm(message: string) {
  const quoted = extractQuotedTerm(message);
  if (quoted) return quoted;

  const match = message.match(
    /(?:ابحث(?:ي)?|search|for|عن|الخاصة بـ|الخاصة بال|باسم|اسمها|اسمه)\s+([^\n.,،]+)/i,
  );
  const candidate = match?.[1]?.trim();
  return candidate && candidate.length >= 2 ? candidate : undefined;
}

function extractProjectId(message: string) {
  const explicit = message.match(
    /(?:id|رقم المشروع|معرف المشروع|project id|project)\s*[:#-]?\s*([a-z0-9_-]{6,})/i,
  );
  if (explicit?.[1]) {
    return explicit[1];
  }

  const tokens = message.match(/\b[a-z0-9]+(?:[_-][a-z0-9]+)+\b/gi);
  return tokens?.[0];
}

function parseStageFilter(text: string): DealStage | undefined {
  if (includesAny(text, ["new", "جديد"])) return "new";
  if (includesAny(text, ["contacted", "تم التواصل", "تواصل"])) return "contacted";
  if (includesAny(text, ["negotiation", "مفاوض", "مفاوضات"])) return "negotiation";
  if (includesAny(text, ["won", "مكسب", "منجزة", "مغلق"])) return "won";
  if (includesAny(text, ["lost", "خاسر", "ضائع"])) return "lost";
  return undefined;
}

function isSearchRequest(normalized: string, searchTerm: string | undefined) {
  return Boolean(
    searchTerm &&
      includesAny(normalized, ["ابحث", "search", "عن", "find", "surfer", "سيرش", "دور"]),
  );
}

function isConfirmationMessage(message: string) {
  const normalized = normalizeCommandText(message);
  return includesAny(normalized, YES_WORDS.map((value) => normalizeCommandText(value)));
}

function formatMoney(value: number | undefined) {
  if (!Number.isFinite(value)) return "غير محدد";
  return `${new Intl.NumberFormat("ar-EG").format(value as number)} ر.س`;
}

function formatDate(value: number | undefined) {
  if (!value) return "بدون موعد";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Cairo",
  }).format(new Date(value));
}

function sameCairoDay(timestamp: number, now = Date.now()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(timestamp)) === formatter.format(new Date(now));
}

function normalizeLooseText(value: string | undefined) {
  return normalizeCommandText(value ?? "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function buildActionDefinition(type: WorkspaceActionState["type"]) {
  switch (type) {
    case "create_project":
      return { id: "create_project", title: "إنشاء مشروع", zone: "projects" as const };
    case "list_clients":
      return { id: "list_clients", title: "قائمة العملاء", zone: "crm" as const };
    case "list_projects":
      return { id: "list_projects", title: "قائمة المشاريع", zone: "projects" as const };
    case "search_projects":
      return { id: "search_projects", title: "بحث المشاريع", zone: "projects" as const };
    case "list_offers":
      return { id: "list_offers", title: "قائمة العروض", zone: "offers" as const };
    case "search_offers":
      return { id: "search_offers", title: "بحث العروض", zone: "offers" as const };
    case "delete_project_confirmation":
      return { id: "delete_project_confirmation", title: "تأكيد حذف المشروع", zone: "projects" as const };
  }
}

function buildFilterSummaryCard(filters: WorkspaceOperatorFilter[]) {
  if (filters.length === 0) return null;
  return {
    id: "workspace-filter-summary",
    componentId: "filter_summary" as const,
    props: {
      title: "الفلاتر المطبقة",
      filters: filters.map((filter) => `${filter.label}: ${filter.value}`),
    },
  };
}

function buildListCard(title: string, items: WorkspaceOperatorListItem[]) {
  return {
    id: `${normalizeCommandText(title).replace(/\s+/g, "-") || "workspace-list"}-card`,
    componentId: "data_list" as const,
    props: {
      title,
      items,
      emptyLabel: "لا توجد نتائج مطابقة.",
    },
  };
}

function buildTargetSummaryCard(params: {
  title: string;
  description: string;
  lines: string[];
}) {
  return {
    id: "workspace-target-summary",
    componentId: "target_summary" as const,
    props: {
      title: params.title,
      description: params.description,
      lines: params.lines,
    },
  };
}

function buildListTurn(actionState: WorkspaceListActionState, assistantText: string): AgUiConversationTurn {
  const action = buildActionDefinition(actionState.type);
  const cards: AgUiCardDefinition[] = [];
  const filterCard = buildFilterSummaryCard(actionState.filters);
  if (filterCard) cards.push(filterCard);
  cards.push(buildListCard(actionState.title, actionState.items));
  cards.push({
    id: `${actionState.type}-result`,
    componentId: "execution_result" as const,
    props: {
      title: actionState.title,
      description: actionState.description,
      status: "done",
    },
  });

  return {
    objective: actionState.type,
    targetZone: action.zone,
    action: { ...action, fields: [] },
    executionState: "completed",
    assistantText,
    cards,
  };
}

function buildDeleteConfirmationTurn(
  actionState: WorkspaceDeleteProjectConfirmationState,
  assistantText: string,
): AgUiConversationTurn {
  const action = buildActionDefinition(actionState.type);
  const cards: AgUiCardDefinition[] = [];
  const filterCard = buildFilterSummaryCard(actionState.filters);
  if (filterCard) cards.push(filterCard);
  cards.push(buildTargetSummaryCard({
      title: "المشروع المحدد للحذف",
      description: actionState.description,
      lines: [
        `اسم المشروع: ${actionState.projectTitle}`,
        `المعرف: ${actionState.projectId}`,
      ],
    }));
  cards.push({
    id: "workspace-delete-confirmation-result",
    componentId: "execution_result" as const,
    props: {
      title: "بانتظار التأكيد",
      description: "لن يتم تنفيذ الحذف حتى ترسل تأكيداً صريحاً مثل: نعم، أكد الحذف.",
      status: "blocked",
    },
  });

  return {
    objective: actionState.type,
    targetZone: action.zone,
    action: { ...action, fields: [] },
    executionState: "collecting",
    assistantText,
    followupQuestion: "أرسل: نعم، أكد الحذف.",
    cards,
  };
}

function buildBlockedTurn(command: WorkspaceActionState["type"], assistantText: string): AgUiConversationTurn {
  const action = buildActionDefinition(command);
  return {
    objective: command,
    targetZone: action.zone,
    action: { ...action, fields: [] },
    executionState: "failed",
    assistantText,
    cards: [
      {
        id: `${command}-blocked`,
        componentId: "execution_result",
        props: {
          title: "الصلاحية غير متاحة",
          description: "الأمر يتطلب مساحة عمل شريك بصلاحيات وسيط أو مطور.",
          status: "blocked",
        },
      },
    ],
  };
}

function parseWorkspaceCommand(message: string): ParsedWorkspaceCommand | null {
  const normalized = normalizeCommandText(message);
  const searchTerm = extractSearchTerm(message);
  const stage = parseStageFilter(normalized);

  const wantsDeleteProject =
    includesAny(normalized, ["احذف", "حذف", "delete", "remove"]) &&
    includesAny(normalized, ["مشروع", "project", "عقار", "property"]);
  if (wantsDeleteProject) {
    return { kind: "delete_project", projectId: extractProjectId(normalized) };
  }

  const wantsClients = includesAny(normalized, [
    "عملائي",
    "العملاء",
    "عميل",
    "عملاء",
    "clients",
    "client",
  ]);
  if (wantsClients) {
    return {
      kind: "list_clients",
      limit: extractLimit(normalized),
      todayOnly: includesAny(normalized, ["اليوم", "لليوم", "today"]),
      stage,
      searchTerm,
    };
  }

  const wantsOffers = includesAny(normalized, ["العروض", "عرض", "offers", "offer"]);
  if (wantsOffers) {
    return {
      kind: isSearchRequest(normalized, searchTerm) ? "search_offers" : "list_offers",
      limit: extractLimit(normalized),
      searchTerm,
    };
  }

  const wantsProjects =
    includesAny(normalized, ["مشاريعي", "المشاريع", "مشروع", "projects", "project", "عقاراتي", "properties", "property"]) &&
    !includesAny(normalized, ["انشاء", "إنشاء", "أضف", "اضف", "create", "new project"]);
  if (wantsProjects) {
    return {
      kind: isSearchRequest(normalized, searchTerm) ? "search_projects" : "list_projects",
      limit: extractLimit(normalized),
      searchTerm,
    };
  }

  return null;
}

async function listWorkspaceDeals(
  ctx: ActionCtx,
  owner: AssistantOwner,
): Promise<DealSummary[]> {
  if (owner.ownerType === "broker" && owner.ownerBrokerId) {
    return (await ctx.runQuery(api.shared_logic.crm.repositories.listDealsByBrokerId, {
      brokerId: owner.ownerBrokerId,
    })) as DealSummary[];
  }

  if (owner.ownerType === "RED" && owner.ownerREDId) {
    return (await ctx.runQuery(api.shared_logic.crm.repositories.listDealsByRedId, {
      REDId: owner.ownerREDId,
    })) as DealSummary[];
  }

  return [];
}

async function listWorkspaceClients(
  ctx: ActionCtx,
  owner: AssistantOwner,
): Promise<ClientSummary[]> {
  if (owner.ownerType === "broker" && owner.ownerBrokerId) {
    return (await ctx.runQuery(api.shared_logic.crm.repositories.listClientsByBrokerId, {
      brokerId: owner.ownerBrokerId,
    })) as ClientSummary[];
  }

  if (owner.ownerType === "RED" && owner.ownerREDId) {
    return (await ctx.runQuery(api.shared_logic.crm.repositories.listClientsByRedId, {
      REDId: owner.ownerREDId,
    })) as ClientSummary[];
  }

  return [];
}

function pickMatchedDeal(client: ClientSummary, deals: DealSummary[]) {
  const clientPhone = normalizeLooseText(client.phone);
  const clientName = normalizeLooseText(client.name);

  return deals.find((deal) => {
    const dealPhone = normalizeLooseText(deal.contactPhone);
    const dealName = normalizeLooseText(deal.contactName ?? deal.title);
    if (clientPhone && dealPhone && clientPhone === dealPhone) return true;
    if (clientName && dealName && clientName === dealName) return true;
    return false;
  });
}

function enrichClientsWithDeals(clients: ClientSummary[], deals: DealSummary[]) {
  return clients.map((client) => ({
    ...client,
    matchedDeal: pickMatchedDeal(client, deals),
  }));
}

async function listWorkspaceProjects(
  ctx: ActionCtx,
  owner: AssistantOwner,
  limit: number,
): Promise<ProjectSummary[]> {
  const paginationOpts = { cursor: null, numItems: Math.min(limit, MAX_LIMIT) };
  if (owner.ownerType === "broker" && owner.ownerBrokerId) {
    const result = (await ctx.runQuery(api.broker_zone.properties.listByBrokerId, {
      brokerId: owner.ownerBrokerId,
      paginationOpts,
    })) as PaginatedPage<ProjectSummary>;
    return result.page;
  }

  if (owner.ownerType === "RED" && owner.ownerREDId) {
    const result = (await ctx.runQuery(api.red_zone.properties.listByRedId, {
      REDId: owner.ownerREDId,
      paginationOpts,
    })) as PaginatedPage<ProjectSummary>;
    return result.page;
  }

  return [];
}

async function getWorkspaceProjectById(
  ctx: ActionCtx,
  owner: AssistantOwner,
  projectId: string,
): Promise<ProjectSummary | null> {
  if (owner.ownerType === "broker" && owner.ownerBrokerId) {
    const project = (await ctx.runQuery(api.broker_zone.properties.getById, {
      id: projectId as Id<"properties">,
    })) as ProjectSummary | null;
    if (!project || project.brokerId !== String(owner.ownerBrokerId)) return null;
    return project;
  }

  if (owner.ownerType === "RED" && owner.ownerREDId) {
    const project = (await ctx.runQuery(api.red_zone.properties.getById, {
      id: projectId as Id<"properties">,
    })) as ProjectSummary | null;
    if (!project || project.REDId !== String(owner.ownerREDId)) return null;
    return project;
  }

  return null;
}

async function deleteWorkspaceProject(
  ctx: ActionCtx,
  owner: AssistantOwner,
  projectId: string,
) {
  const project = await getWorkspaceProjectById(ctx, owner, projectId);
  if (!project) {
    throw new Error("PROJECT_NOT_FOUND_OR_UNAUTHORIZED");
  }

  if (owner.ownerType === "broker") {
    await ctx.runMutation(api.broker_zone.properties.remove, {
      id: projectId as Id<"properties">,
    });
    return;
  }

  if (owner.ownerType === "RED") {
    await ctx.runMutation(api.red_zone.properties.remove, {
      id: projectId as Id<"properties">,
    });
    return;
  }

  throw new Error("PROJECT_DELETE_UNAVAILABLE");
}

async function listWorkspaceOffers(ctx: ActionCtx): Promise<{
  sent: OfferSummary[];
  received: OfferSummary[];
  marketplace: OfferSummary[];
}> {
  const [sent, received, marketplace] = await Promise.all([
    ctx.runQuery(api.shared_logic.offers.listSentOffers, {}),
    ctx.runQuery(api.shared_logic.offers.listReceivedOffers, {}),
    ctx.runQuery(api.shared_logic.offers.listPublicOffers, {}),
  ]);
  const mapOffer = (offer: any): OfferSummary => ({
    id: String(offer.id ?? offer._id),
    price: offer.price,
    status: offer.status,
    publicationState: offer.publicationState,
    visibility: offer.visibility,
    property: offer.property
      ? {
          title: offer.property.title,
          address: offer.property.address,
        }
      : null,
    description: offer.description,
    message: offer.message,
  });

  return {
    sent: (sent as any[]).map(mapOffer),
    received: (received as any[]).map(mapOffer),
    marketplace: (marketplace as any[]).map(mapOffer),
  };
}

function filterBySearchTerm<T>(
  items: T[],
  searchTerm: string | undefined,
  projector: (item: T) => string,
) {
  if (!searchTerm) return items;
  const normalizedTerm = normalizeCommandText(searchTerm);
  return items.filter((item) =>
    normalizeCommandText(projector(item)).includes(normalizedTerm),
  );
}

function buildClientActionState(params: {
  command: Extract<ParsedWorkspaceCommand, { kind: "list_clients" }>;
  clients: EnrichedClientSummary[];
}) {
  const filters: WorkspaceOperatorFilter[] = [];
  if (params.command.todayOnly) filters.push({ label: "الوقت", value: "اليوم" });
  if (params.command.stage) filters.push({ label: "المرحلة", value: params.command.stage });
  if (params.command.searchTerm) filters.push({ label: "البحث", value: params.command.searchTerm });

  const items: WorkspaceOperatorListItem[] = params.clients.map((client) => ({
    id: client.id,
    title: client.name,
    subtitle: [client.phone, client.email].filter(Boolean).join(" · ") || "بدون وسيلة تواصل مكتملة",
    meta: client.matchedDeal
      ? `المرحلة: ${client.matchedDeal.stage} · المتابعة: ${formatDate(client.matchedDeal.nextFollowUpAt)}`
      : `آخر تحديث: ${formatDate(client.updatedAt)}`,
  }));

  return {
    type: "list_clients" as const,
    zone: "crm" as const,
    state: "completed" as const,
    title: params.command.todayOnly ? "عملاء اليوم" : "قائمة العملاء",
    description: params.clients.length
      ? `تم تجهيز ${params.clients.length} سجل عميل من مساحة العمل الحالية.`
      : "لم يتم العثور على سجلات عملاء مطابقة.",
    totalCount: params.clients.length,
    filters,
    items,
  };
}

async function handleListClientsCommand(
  ctx: ActionCtx,
  owner: AssistantOwner,
  command: Extract<ParsedWorkspaceCommand, { kind: "list_clients" }>,
): Promise<WorkspaceDirectCommandResult> {
  const [clients, deals] = await Promise.all([
    listWorkspaceClients(ctx, owner),
    listWorkspaceDeals(ctx, owner),
  ]);

  let enriched = enrichClientsWithDeals(clients, deals);

  if (command.searchTerm) {
    enriched = filterBySearchTerm(
      enriched,
      command.searchTerm,
      (client) => `${client.name} ${client.phone ?? ""} ${client.email ?? ""} ${client.notes ?? ""}`,
    );
  }

  if (command.stage) {
    enriched = enriched.filter((client) => client.matchedDeal?.stage === command.stage);
  }

  if (command.todayOnly) {
    enriched = enriched.filter((client) =>
      Boolean(
        (client.matchedDeal?.nextFollowUpAt && sameCairoDay(client.matchedDeal.nextFollowUpAt)) ||
        sameCairoDay(client.updatedAt) ||
        sameCairoDay(client.createdAt),
      ),
    );
  }

  const selectedClients = enriched.slice(0, command.limit);
  const actionState = buildClientActionState({
    command,
    clients: selectedClients,
  });

  const assistantText = selectedClients.length
    ? [
        actionState.title,
        ...selectedClients.map((client, index) => {
          const contact = [client.phone, client.email].filter(Boolean).join(" · ");
          const dealLine = client.matchedDeal
            ? ` · المرحلة: ${client.matchedDeal.stage} · المتابعة: ${formatDate(client.matchedDeal.nextFollowUpAt)}`
            : "";
          return `${index + 1}. ${client.name}${contact ? ` · ${contact}` : ""}${dealLine}`;
        }),
      ].join("\n")
    : command.todayOnly
      ? "لا توجد سجلات عملاء مطابقة لليوم."
      : "لا توجد سجلات عملاء مطابقة حالياً.";

  return {
    assistantText,
    meta: {
      command: actionState.type,
      count: selectedClients.length,
      todayOnly: command.todayOnly,
      stage: command.stage ?? null,
      searchTerm: command.searchTerm ?? null,
    },
    uiTurn: buildListTurn(actionState, assistantText),
    actionState,
  };
}

function buildProjectListActionState(params: {
  command: Extract<ParsedWorkspaceCommand, { kind: "list_projects" | "search_projects" }>;
  projects: ProjectSummary[];
}): WorkspaceListActionState {
  const filters: WorkspaceOperatorFilter[] = [];
  if (params.command.searchTerm) filters.push({ label: "البحث", value: params.command.searchTerm });

  return {
    type: params.command.kind,
    zone: "projects",
    state: "completed",
    title: params.command.kind === "search_projects" ? "نتائج بحث المشاريع" : "قائمة المشاريع",
    description: params.projects.length
      ? `تم تجهيز ${params.projects.length} مشروع/عقار من مساحة العمل الحالية.`
      : "لم يتم العثور على مشاريع مطابقة.",
    totalCount: params.projects.length,
    filters,
    items: params.projects.map((project) => ({
      id: project._id,
      title: project.title,
      subtitle: project.address,
      meta: `${formatMoney(project.price)} · ${project.publicationState ?? project.status ?? "غير محددة"}`,
    })),
  };
}

async function handleListProjectsCommand(
  ctx: ActionCtx,
  owner: AssistantOwner,
  command: Extract<ParsedWorkspaceCommand, { kind: "list_projects" | "search_projects" }>,
): Promise<WorkspaceDirectCommandResult> {
  const projects = await listWorkspaceProjects(ctx, owner, command.limit);
  const filteredProjects = filterBySearchTerm(
    projects,
    command.searchTerm,
    (project) => `${project.title} ${project.address} ${project.publicationState ?? ""}`,
  ).slice(0, command.limit);

  const actionState = buildProjectListActionState({
    command,
    projects: filteredProjects,
  });

  const assistantText = filteredProjects.length
    ? [
        actionState.title,
        ...filteredProjects.map((project, index) =>
          `${index + 1}. ${project.title} · ${project.address} · ${formatMoney(project.price)} · الحالة: ${project.publicationState ?? project.status ?? "غير محددة"} · المعرف: ${project._id}`,
        ),
      ].join("\n")
    : command.searchTerm
      ? `لم أجد مشاريع مطابقة لعبارة "${command.searchTerm}".`
      : "لا توجد مشاريع متاحة حالياً في مساحة العمل.";

  return {
    assistantText,
    meta: {
      command: actionState.type,
      count: filteredProjects.length,
      searchTerm: command.searchTerm ?? null,
    },
    uiTurn: buildListTurn(actionState, assistantText),
    actionState,
  };
}

async function handleDeleteProjectCommand(
  ctx: ActionCtx,
  owner: AssistantOwner,
  command: Extract<ParsedWorkspaceCommand, { kind: "delete_project" }>,
  previousActionState: WorkspaceActionState | null,
  message: string,
): Promise<WorkspaceDirectCommandResult> {
  const previousDeleteState =
    previousActionState?.type === "delete_project_confirmation"
      ? previousActionState
      : null;

  if (previousDeleteState && isConfirmationMessage(message)) {
    await deleteWorkspaceProject(ctx, owner, previousDeleteState.projectId);
    const actionState: WorkspaceDeleteProjectConfirmationState = {
      ...previousDeleteState,
      state: "completed",
      requiresConfirmation: false,
    };
    const assistantText = `تم حذف المشروع ${previousDeleteState.projectTitle} بنجاح.`;
    return {
      assistantText,
      meta: {
        command: "delete_project_confirmation",
        projectId: previousDeleteState.projectId,
        deleted: true,
      },
      uiTurn: {
        objective: actionState.type,
        targetZone: "projects",
        action: { ...buildActionDefinition(actionState.type), fields: [] },
        executionState: "completed",
        assistantText,
        cards: [
          {
            id: "workspace-delete-project-done",
            componentId: "execution_result",
            props: {
              title: "تم حذف المشروع",
              description: `تم تنفيذ حذف المشروع ${previousDeleteState.projectTitle} ضمن صلاحيات المستخدم الحالية.`,
              status: "done",
            },
          },
        ],
      },
      actionState,
    };
  }

  if (!command.projectId) {
    const assistantText =
      "أستطيع حذف المشروع من مساحة العمل، لكن أحتاج معرف المشروع أولاً. أرسل `project id` أو `رقم المشروع` كما ظهر في القائمة.";
    return {
      assistantText,
      meta: { command: command.kind, requiresProjectId: true },
      uiTurn: {
        objective: "delete_project_confirmation",
        targetZone: "projects",
        action: { ...buildActionDefinition("delete_project_confirmation"), fields: [] },
        executionState: "failed",
        assistantText,
        cards: [
          {
            id: "workspace-delete-project-missing-id",
            componentId: "execution_result",
            props: {
              title: "حذف مشروع",
              description: "يلزم إرسال معرف المشروع قبل تنفيذ الحذف.",
              status: "blocked",
            },
          },
        ],
      },
      actionState: null,
    };
  }

  const project = await getWorkspaceProjectById(ctx, owner, command.projectId);
  if (!project) {
    const assistantText = "لم أتمكن من العثور على هذا المشروع داخل نطاق صلاحياتك الحالية.";
    return {
      assistantText,
      meta: { command: command.kind, projectId: command.projectId, blocked: true },
      uiTurn: {
        objective: "delete_project_confirmation",
        targetZone: "projects",
        action: { ...buildActionDefinition("delete_project_confirmation"), fields: [] },
        executionState: "failed",
        assistantText,
        cards: [
          {
            id: "workspace-delete-project-not-found",
            componentId: "execution_result",
            props: {
              title: "تعذر تحديد المشروع",
              description: "المشروع غير موجود أو لا يدخل ضمن صلاحيات المستخدم الحالية.",
              status: "blocked",
            },
          },
        ],
      },
      actionState: null,
    };
  }

  const actionState: WorkspaceDeleteProjectConfirmationState = {
    type: "delete_project_confirmation",
    zone: "projects",
    state: "collecting",
    projectId: project._id,
    projectTitle: project.title,
    description: `${project.address} · ${formatMoney(project.price)}`,
    filters: [
      { label: "المعرف", value: project._id },
      { label: "الحالة", value: project.publicationState ?? project.status ?? "غير محددة" },
    ],
    requiresConfirmation: true,
  };

  const assistantText =
    `حددت المشروع المطلوب للحذف: ${project.title}. إذا كنت متأكداً، أرسل: نعم، أكد الحذف.`;

  return {
    assistantText,
    meta: {
      command: actionState.type,
      projectId: project._id,
      requiresConfirmation: true,
    },
    uiTurn: buildDeleteConfirmationTurn(actionState, assistantText),
    actionState,
  };
}

function buildOfferListActionState(params: {
  command: Extract<ParsedWorkspaceCommand, { kind: "list_offers" | "search_offers" }>;
  offers: Array<OfferSummary & { source: string }>;
}): WorkspaceListActionState {
  const filters: WorkspaceOperatorFilter[] = [];
  if (params.command.searchTerm) filters.push({ label: "البحث", value: params.command.searchTerm });

  return {
    type: params.command.kind,
    zone: "offers",
    state: "completed",
    title: params.command.kind === "search_offers" ? "نتائج بحث العروض" : "قائمة العروض",
    description: params.offers.length
      ? `تم تجهيز ${params.offers.length} عرضاً من البيانات المتاحة للمستخدم الحالي.`
      : "لم يتم العثور على عروض مطابقة.",
    totalCount: params.offers.length,
    filters,
    items: params.offers.map((offer) => ({
      id: offer.id,
      title: offer.property?.title ?? "عرض بدون عقار واضح",
      subtitle: offer.property?.address ?? offer.source,
      meta: `${formatMoney(offer.price)} · ${offer.publicationState ?? offer.status}`,
    })),
  };
}

async function handleListOffersCommand(
  ctx: ActionCtx,
  command: Extract<ParsedWorkspaceCommand, { kind: "list_offers" | "search_offers" }>,
): Promise<WorkspaceDirectCommandResult> {
  const { sent, received, marketplace } = await listWorkspaceOffers(ctx);
  const allOffers = [
    ...sent.map((offer) => ({ source: "مرسل", ...offer })),
    ...received.map((offer) => ({ source: "وارد", ...offer })),
    ...marketplace.map((offer) => ({ source: "السوق", ...offer })),
  ];

  const filteredOffers = filterBySearchTerm(
    allOffers,
    command.searchTerm,
    (offer) =>
      `${offer.property?.title ?? ""} ${offer.property?.address ?? ""} ${offer.description ?? ""} ${offer.message ?? ""} ${offer.source}`,
  ).slice(0, command.limit);

  const actionState = buildOfferListActionState({
    command,
    offers: filteredOffers,
  });

  const assistantText = filteredOffers.length
    ? [
        actionState.title,
        ...filteredOffers.map((offer, index) =>
          `${index + 1}. ${offer.property?.title ?? "عرض بدون عقار واضح"} · ${offer.source} · ${formatMoney(offer.price)} · الحالة: ${offer.publicationState ?? offer.status} · المعرف: ${offer.id}`,
        ),
      ].join("\n")
    : command.searchTerm
      ? `لم أجد عروضاً مطابقة لعبارة "${command.searchTerm}".`
      : "لا توجد عروض متاحة حالياً.";

  return {
    assistantText,
    meta: {
      command: actionState.type,
      count: filteredOffers.length,
      searchTerm: command.searchTerm ?? null,
    },
    uiTurn: buildListTurn(actionState, assistantText),
    actionState,
  };
}

/**
 * WHY:   Concrete workspace asks like "my clients today" or "delete project X" should execute directly instead of going through the generic orchestrator every time.
 * WHAT:  Detects a small set of operational workspace commands and returns real, auth-scoped data or confirmation-gated mutations.
 * HOW:   Uses deterministic intent parsing, current owner-scoped Convex queries/mutations, richer workspace action state, and data-first Arabic UI cards.
 */
export async function maybeHandleWorkspaceDirectCommand(params: {
  ctx: ActionCtx;
  message: string;
  owner: AssistantOwner;
  previousActionState?: WorkspaceActionState | null;
}): Promise<WorkspaceDirectCommandResult | null> {
  if (
    params.previousActionState?.type === "delete_project_confirmation" &&
    params.previousActionState.state === "collecting" &&
    isConfirmationMessage(params.message)
  ) {
    return handleDeleteProjectCommand(
      params.ctx,
      params.owner,
      { kind: "delete_project", projectId: params.previousActionState.projectId },
      params.previousActionState,
      params.message,
    );
  }

  const command = parseWorkspaceCommand(params.message);
  const commandType = command?.kind === "search_projects"
    ? "search_projects"
    : command?.kind === "list_projects"
      ? "list_projects"
      : command?.kind === "search_offers"
        ? "search_offers"
        : command?.kind === "list_offers"
          ? "list_offers"
          : command?.kind === "delete_project"
            ? "delete_project_confirmation"
            : command?.kind === "list_clients"
              ? "list_clients"
              : null;

  if (!command) {
    return null;
  }

  if (params.owner.ownerType === "user") {
    const assistantText =
      "هذا النوع من أوامر مساحة العمل متاح حالياً لحسابات الوسطاء والمطورين فقط.";
    return {
      assistantText,
      meta: { command: command.kind, blocked: true, reason: "owner_type_user" },
      uiTurn: buildBlockedTurn(commandType ?? "list_projects", assistantText),
      actionState: null,
    };
  }

  switch (command.kind) {
    case "list_clients":
      return handleListClientsCommand(params.ctx, params.owner, command);
    case "list_projects":
    case "search_projects":
      return handleListProjectsCommand(params.ctx, params.owner, command);
    case "delete_project":
      return handleDeleteProjectCommand(
        params.ctx,
        params.owner,
        command,
        params.previousActionState ?? null,
        params.message,
      );
    case "list_offers":
    case "search_offers":
      return handleListOffersCommand(params.ctx, command);
    default:
      return null;
  }
}
