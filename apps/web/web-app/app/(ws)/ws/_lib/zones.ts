import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  LayoutGrid,
  MessageSquareQuote,
  Settings2,
  Sparkles,
  Mail,
} from "lucide-react";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";

export type WorkspaceRole = string | null | undefined;

export type ZoneNavItem = {
  label: string;
  href?: string;
  disabled?: boolean;
};

export type ZoneDescriptor = {
  key: WorkspaceZoneKey;
  label: string;
  href: string;
  description: string;
  icon: typeof LayoutGrid;
  roles: WorkspaceRole[];
  localNav: ZoneNavItem[];
};

export type ZoneShellData = Pick<ZoneDescriptor, "key" | "label" | "description" | "localNav">;

const zoneDescriptors: ZoneDescriptor[] = [
  {
    key: "overview",
    label: "لوحة العمل",
    href: "/ws",
    description: "ملخص سريع للمنظمة ومسارات العمل الأساسية داخل المنصة.",
    icon: LayoutGrid,
    roles: ["developer", "RED", "broker", "admin", null, undefined],
    localNav: [],
  },
  {
    key: "market",
    label: "ذكاء السوق",
    href: "/ws/market",
    description: "تحليل الطلب والأسعار وسرعة البيع على مستوى المدن والأحياء للمطور.",
    icon: BarChart3,
    roles: ["developer", "RED", "broker", "admin", null, undefined],
    localNav: [
      { label: "المدن", href: "/ws/market/cities" },
      { label: "الأحياء", href: "/ws/market/areas" },
      { label: "الفرص", href: "/ws/market/opportunities" },
      { label: "البحث والكلمات", href: "/ws/market/research" },
    ],
  },
  {
    key: "projects",
    label: "المشاريع",
    href: "/ws/projects",
    description: "إدارة مخزون المشاريع والعقارات المرتبط بالحساب الحالي.",
    icon: Building2,
    roles: ["developer", "RED", "broker"],
    localNav: [
      { label: "جميع المشاريع", href: "/ws/projects" },
    ],
  },
  {
    key: "offers",
    label: "العروض",
    href: "/ws/offers",
    description: "سوق العروض العقارية — استعرض، أنشئ، وتقدم للفرص الاستثمارية.",
    icon: BriefcaseBusiness,
    roles: ["developer", "RED", "broker"],
    localNav: [
      { label: "سوق العروض", href: "/ws/offers" },
    ],
  },
  {
    key: "crm",
    label: "إدارة العملاء",
    href: "/ws/crm",
    description: "رؤية صفقات العملاء ومراحل التقدم داخل المسار البيعي.",
    icon: MessageSquareQuote,
    roles: ["developer", "RED", "broker"],
    localNav: [
      { label: "خط الأنابيب", href: "/ws/crm" },
      { label: "العملاء", href: "/ws/crm/clients" },
    ],
  },
  {
    key: "inbox",
    label: "البريد الوارد",
    href: "/ws/inbox",
    description: "إدارة المحادثات والتواصل مع الوسطاء والمستثمرين والمطورين.",
    icon: Mail,
    roles: ["developer", "RED", "broker"],
    localNav: [],
  },
  {
    key: "settings",
    label: "إعدادات المنظمة",
    href: "/ws/settings",
    description: "إدارة أعضاء المنظمة والدعوات والأدوار من نفس مساحة العمل.",
    icon: Settings2,
    roles: ["developer", "RED", "broker", "admin"],
    localNav: [],
  },
];

function isVisibleToRole(zone: ZoneDescriptor, role: WorkspaceRole) {
  return zone.roles.includes(role);
}

/**
 * WHY:   Workspace navigation should be driven by one role-aware source of truth across shells and zone pages.
 * WHAT:  Returns the workspace zones visible to the supplied session role.
 * HOW:   Filters the static zone descriptor list by the descriptor role visibility rules.
 */
export function getWorkspaceZones(role: WorkspaceRole) {
  return zoneDescriptors.filter((zone) => isVisibleToRole(zone, role));
}

/**
 * WHY:   The server behavior model now decides zone visibility and the client needs a key-based lookup.
 * WHAT:  Returns the zone descriptors matching the supplied server-approved zone keys.
 * HOW:   Filters the static descriptor list against a `Set` of allowed keys.
 */
export function getWorkspaceZonesForKeys(keys: WorkspaceZoneKey[]) {
  const keySet = new Set(keys);
  return zoneDescriptors.filter((zone) => keySet.has(zone.key));
}

/**
 * WHY:   Zone layouts need a stable lookup for their current descriptor and local navigation metadata.
 * WHAT:  Returns one visible zone descriptor for the supplied key and role, or null when hidden.
 * HOW:   Reuses the shared visible-zone list and performs a simple key match.
 */
export function getWorkspaceZone(
  role: WorkspaceRole,
  key: ZoneDescriptor["key"],
) {
  return getWorkspaceZones(role).find((zone) => zone.key === key) ?? null;
}

/**
 * WHY:   Server layouts must pass serializable data into client zone-shell components.
 * WHAT:  Narrows a full zone descriptor to the plain-object subset used by the zone shell.
 * HOW:   Drops non-serializable fields such as icon component references and role metadata.
 */
export function toZoneShellData(zone: ZoneDescriptor): ZoneShellData {
  return {
    key: zone.key,
    label: zone.label,
    description: zone.description,
    localNav: zone.localNav,
  };
}
