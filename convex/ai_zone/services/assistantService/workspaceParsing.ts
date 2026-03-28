import type {
  WorkspaceActionCandidate,
  WorkspaceDeleteProjectConfirmationState,
  WorkspaceListActionState,
  WorkspaceProjectActionCandidate,
  WorkspaceProjectFieldKey,
  WorkspaceStructuredOutput,
} from "../../agents/anan_workspace/types";
import { FIELD_QUESTION_MAP, PROJECT_REQUIRED_FIELDS, type WorkspaceProjectFields } from "./types";

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

function parseSimpleFieldValue(
  message: string,
  key: WorkspaceProjectFieldKey
): string | number | undefined {
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

export function extractProjectFieldsFromText(
  message: string,
  expectedField?: WorkspaceProjectFieldKey
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

export function computeMissingFields(
  fields: WorkspaceProjectFields
): WorkspaceProjectFieldKey[] {
  return PROJECT_REQUIRED_FIELDS.filter((field) => {
    const value = fields[field];
    if (typeof value === "number") return !Number.isFinite(value);
    return typeof value !== "string" || value.trim().length === 0;
  });
}

export function hasCreateProjectIntent(
  message: string,
  structured?: WorkspaceStructuredOutput
): boolean {
  const normalized = message.toLowerCase();
  if (structured?.actionCandidate?.type === "create_project") return true;
  return (
    /(?:إنشاء|انشاء|اضف|أضف|ابدأ|ابدء|أنشئ).{0,12}(?:مشروع|عقار)/.test(message) ||
    normalized.includes("create project") ||
    normalized.includes("new project")
  );
}

export function buildProjectQuestions(
  missingFields: WorkspaceProjectFieldKey[]
): string[] {
  return missingFields.map((field) => FIELD_QUESTION_MAP[field]);
}

function normalizeStructuredQuestions(candidate: { questions?: unknown }) {
  return Array.isArray(candidate.questions)
    ? candidate.questions
        .filter((item): item is string => typeof item === "string")
        .slice(0, 8)
    : [];
}

function normalizeWorkspaceActionState(state: unknown) {
  return state === "ready" || state === "completed" || state === "failed"
    ? state
    : "collecting";
}

function normalizeWorkspaceOperatorFilters(filters: unknown) {
  if (!Array.isArray(filters)) return [];
  return filters
    .map((filter) => {
      if (!filter || typeof filter !== "object") return null;
      const value = filter as { label?: unknown; value?: unknown };
      if (typeof value.label !== "string" || typeof value.value !== "string") {
        return null;
      }
      return { label: value.label, value: value.value };
    })
    .filter((filter): filter is NonNullable<typeof filter> => Boolean(filter))
    .slice(0, 8);
}

function normalizeWorkspaceOperatorItems(items: unknown) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const value = item as {
        id?: unknown;
        title?: unknown;
        subtitle?: unknown;
        meta?: unknown;
      };
      if (typeof value.id !== "string" || typeof value.title !== "string") {
        return null;
      }
      return {
        id: value.id,
        title: value.title,
        subtitle: typeof value.subtitle === "string" ? value.subtitle : undefined,
        meta: typeof value.meta === "string" ? value.meta : undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 50);
}

function normalizeWorkspaceListActionState(actionCandidate: unknown): WorkspaceListActionState | null {
  if (!actionCandidate || typeof actionCandidate !== "object") {
    return null;
  }
  const action = actionCandidate as {
    type?: unknown;
    zone?: unknown;
    state?: unknown;
    title?: unknown;
    description?: unknown;
    totalCount?: unknown;
    filters?: unknown;
    items?: unknown;
  };

  if (
    action.type !== "list_clients" &&
    action.type !== "list_projects" &&
    action.type !== "search_projects" &&
    action.type !== "list_offers" &&
    action.type !== "search_offers"
  ) {
    return null;
  }

  if (action.zone !== "crm" && action.zone !== "projects" && action.zone !== "offers") {
    return null;
  }

  return {
    type: action.type,
    zone: action.zone,
    state: "completed",
    title: typeof action.title === "string" ? action.title : "نتائج مساحة العمل",
    description: typeof action.description === "string" ? action.description : "",
    totalCount: typeof action.totalCount === "number" ? action.totalCount : 0,
    filters: normalizeWorkspaceOperatorFilters(action.filters),
    items: normalizeWorkspaceOperatorItems(action.items),
  };
}

function normalizeWorkspaceDeleteProjectConfirmationState(
  actionCandidate: unknown,
): WorkspaceDeleteProjectConfirmationState | null {
  if (!actionCandidate || typeof actionCandidate !== "object") {
    return null;
  }

  const action = actionCandidate as {
    type?: unknown;
    zone?: unknown;
    state?: unknown;
    projectId?: unknown;
    projectTitle?: unknown;
    description?: unknown;
    filters?: unknown;
    requiresConfirmation?: unknown;
  };

  if (action.type !== "delete_project_confirmation" || action.zone !== "projects") {
    return null;
  }

  if (typeof action.projectId !== "string" || typeof action.projectTitle !== "string") {
    return null;
  }

  return {
    type: "delete_project_confirmation",
    zone: "projects",
    state: action.state === "completed" || action.state === "failed" ? action.state : "collecting",
    projectId: action.projectId,
    projectTitle: action.projectTitle,
    description: typeof action.description === "string" ? action.description : "",
    filters: normalizeWorkspaceOperatorFilters(action.filters),
    requiresConfirmation: action.requiresConfirmation !== false,
  };
}

function normalizeWorkspaceActionCandidate(actionCandidate: unknown): WorkspaceProjectActionCandidate | null {
  if (!actionCandidate || typeof actionCandidate !== "object") {
    return null;
  }
  const action = actionCandidate as {
    type?: unknown;
    fields?: unknown;
    missingFields?: unknown;
    state?: unknown;
  };
  if (action.type !== "create_project") {
    return null;
  }
  return {
    type: "create_project",
    fields:
      typeof action.fields === "object" && action.fields
        ? (action.fields as any)
        : {},
    missingFields: Array.isArray(action.missingFields)
      ? action.missingFields
          .filter((field): field is WorkspaceProjectFieldKey =>
            PROJECT_REQUIRED_FIELDS.includes(field as WorkspaceProjectFieldKey)
          )
      : [...PROJECT_REQUIRED_FIELDS],
    state: normalizeWorkspaceActionState(action.state),
  };
}

function normalizeWorkspaceActionCandidateUnion(actionCandidate: unknown): WorkspaceActionCandidate | null {
  return (
    normalizeWorkspaceActionCandidate(actionCandidate) ??
    normalizeWorkspaceListActionState(actionCandidate) ??
    normalizeWorkspaceDeleteProjectConfirmationState(actionCandidate)
  );
}

export function normalizeWorkspaceStructuredOutput(
  value: unknown
): WorkspaceStructuredOutput {
  if (!value || typeof value !== "object") {
    return { questions: [] };
  }

  const candidate = value as { questions?: unknown; actionCandidate?: unknown };
  const questions = normalizeStructuredQuestions(candidate);
  const normalizedCandidate = normalizeWorkspaceActionCandidateUnion(candidate.actionCandidate);
  if (!normalizedCandidate) {
    return { questions };
  }
  return { questions, actionCandidate: normalizedCandidate };
}
