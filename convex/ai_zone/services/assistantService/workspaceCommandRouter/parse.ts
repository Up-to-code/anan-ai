import type { ParsedWorkspaceCommand, DealStage } from "./types";

const MAX_LIMIT = 30;
const DEFAULT_LIMIT = 10;
const YES_WORDS = ["نعم", "ايوه", "أيوه", "أكيد", "اكيد", "أكد", "تأكيد", "confirm", "yes", "delete it", "احذف الآن"];

export function normalizeArabicDigits(input: string) {
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

export function normalizeCommandText(input: string) {
  return normalizeArabicDigits(input).toLowerCase().replace(/\s+/g, " ").trim();
}

function includesAny(text: string, values: readonly string[]) {
  return values.some((value) => text.includes(value));
}

export function extractLimit(text: string) {
  const normalized = normalizeArabicDigits(text);
  const match = normalized.match(/\b(\d{1,2})\b/);
  if (!match) return DEFAULT_LIMIT;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function extractQuotedTerm(message: string) {
  const quoted = message.match(/["'`“”](.+?)["'`“”]/);
  return quoted?.[1]?.trim();
}

export function extractSearchTerm(message: string) {
  const quoted = extractQuotedTerm(message);
  if (quoted) return quoted;

  const match = message.match(
    /(?:ابحث(?:ي)?|search|for|عن|الخاصة بـ|الخاصة بال|باسم|اسمها|اسمه)\s+([^\n.,،]+)/i,
  );
  const candidate = match?.[1]?.trim();
  return candidate && candidate.length >= 2 ? candidate : undefined;
}

export function extractProjectId(message: string) {
  const explicit = message.match(
    /(?:id|رقم المشروع|معرف المشروع|project id|project)\s*[:#-]?\s*([a-z0-9_-]{6,})/i,
  );
  if (explicit?.[1]) {
    return explicit[1];
  }

  const tokens = message.match(/\b[a-z0-9]+(?:[_-][a-z0-9]+)+\b/gi);
  return tokens?.[0];
}

export function parseStageFilter(text: string): DealStage | undefined {
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

export function isConfirmationMessage(message: string) {
  const normalized = normalizeCommandText(message);
  return includesAny(normalized, YES_WORDS.map((value) => normalizeCommandText(value)));
}

export function parseWorkspaceCommand(message: string): ParsedWorkspaceCommand | null {
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

export function getCommandActionType(command: ParsedWorkspaceCommand) {
  switch (command.kind) {
    case "search_projects":
      return "search_projects";
    case "list_projects":
      return "list_projects";
    case "search_offers":
      return "search_offers";
    case "list_offers":
      return "list_offers";
    case "delete_project":
      return "delete_project_confirmation";
    case "list_clients":
      return "list_clients";
  }
}
