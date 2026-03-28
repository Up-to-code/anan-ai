import type {
  WorkspaceDeleteProjectConfirmationState,
  WorkspaceListActionState,
} from "../agents/anan_workspace/types";
import type { WorkspaceActionState, WorkspaceUploadedFileReference } from "./assistantService/types";
import type { AgUiCardDefinition, AgUiConversationTurn } from "./agUi/types";

type WorkspaceAgUiOptions = {
  assistantText: string;
  ownerType: "broker" | "RED" | "user";
  actionState: WorkspaceActionState | null;
  attachments?: WorkspaceUploadedFileReference[];
};

const WORKSPACE_ZONE_ACCESS: Record<WorkspaceAgUiOptions["ownerType"], readonly string[]> = {
  broker: ["projects", "offers", "crm", "market"],
  RED: ["projects", "offers", "market", "crm"],
  user: ["market"],
};

const ACTION_DEFINITIONS = {
  create_project: {
    id: "create_project",
    title: "إنشاء مشروع",
    zone: "projects",
    fields: ["name", "city", "district", "price", "rooms", "bathrooms", "description"],
  },
  list_clients: {
    id: "list_clients",
    title: "قائمة العملاء",
    zone: "crm",
    fields: [],
  },
  list_projects: {
    id: "list_projects",
    title: "قائمة المشاريع",
    zone: "projects",
    fields: [],
  },
  search_projects: {
    id: "search_projects",
    title: "بحث المشاريع",
    zone: "projects",
    fields: [],
  },
  list_offers: {
    id: "list_offers",
    title: "قائمة العروض",
    zone: "offers",
    fields: [],
  },
  search_offers: {
    id: "search_offers",
    title: "بحث العروض",
    zone: "offers",
    fields: [],
  },
  delete_project_confirmation: {
    id: "delete_project_confirmation",
    title: "تأكيد حذف المشروع",
    zone: "projects",
    fields: [],
  },
} as const;

function getActionDefinition(type: keyof typeof ACTION_DEFINITIONS): AgUiConversationTurn["action"] {
  const definition = ACTION_DEFINITIONS[type];
  return {
    id: definition.id,
    title: definition.title,
    zone: definition.zone,
    fields: [...definition.fields],
  };
}

function hasProjectWriteAccess(ownerType: WorkspaceAgUiOptions["ownerType"]) {
  return WORKSPACE_ZONE_ACCESS[ownerType].includes("projects");
}

function toText(value: string | number | undefined, fallback = "غير محدد") {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("ar-SA").format(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

function buildAttachmentReceiptCard(
  attachments: WorkspaceUploadedFileReference[] | undefined,
): AgUiCardDefinition[] {
  if (!attachments || attachments.length === 0) {
    return [];
  }

  const imageCount = attachments.filter((file) => file.mime?.startsWith("image/")).length;
  const label =
    imageCount > 0
      ? `تم استلام ${imageCount} صورة و${attachments.length - imageCount} ملف إضافي.`
      : `تم استلام ${attachments.length} ملف مرفق.`;

  return [
    {
      id: "workspace-attachments-received",
      componentId: "execution_result",
      props: {
        title: "تم استلام المرفقات",
        description: `${label} ${attachments.map((file) => file.name).join("، ")}`,
        status: "running",
      },
    },
  ];
}

function buildFilterSummaryCard(filters: Array<{ label: string; value: string }>): AgUiCardDefinition | null {
  if (filters.length === 0) return null;
  return {
    id: "workspace-filter-summary",
    componentId: "filter_summary",
    props: {
      title: "الفلاتر المطبقة",
      filters: filters.map((filter) => `${filter.label}: ${filter.value}`),
    },
  };
}

function buildProjectDraftCard(actionState: Extract<WorkspaceActionState, { type: "create_project" }>): AgUiCardDefinition {
  return {
    id: "workspace-project-draft",
    componentId: "project_create_draft",
    props: {
      name: toText(actionState.fields.name, "مسودة مشروع جديدة"),
      city: toText(actionState.fields.city),
      district: toText(actionState.fields.district),
      price: actionState.fields.price ? `${toText(actionState.fields.price)} ر.س` : "غير محدد",
      brokerFee: "يحدد لاحقاً",
      rooms: toText(actionState.fields.rooms),
      bathrooms: toText(actionState.fields.bathrooms),
      summary: toText(actionState.fields.description, "بانتظار وصف مختصر للمشروع قبل الحفظ النهائي."),
    },
  };
}

function buildCollectingCards(
  actionState: Extract<WorkspaceActionState, { type: "create_project" }>,
): AgUiCardDefinition[] {
  return [
    {
      id: "workspace-project-missing-fields",
      componentId: "field_request_list",
      props: {
        title: "المساعد يحتاج هذه البيانات قبل إنشاء المشروع",
        fields: actionState.missingFields,
      },
    },
    {
      id: "workspace-project-followup",
      componentId: "missing_data_prompt",
      props: {
        prompt:
          actionState.missingFields.length > 0
            ? `أرسل ${actionState.missingFields[0]} أولاً، ويمكنك أيضاً إرفاق صور أو ملفات تدعم المسودة.`
            : "أرسل أي تفاصيل إضافية تريد إضافتها إلى المشروع.",
      },
    },
  ];
}

function buildCompletedCard(
  actionState: Extract<WorkspaceActionState, { type: "create_project" }>,
): AgUiCardDefinition {
  return {
    id: "workspace-project-completed",
    componentId: "execution_result",
    props: {
      title: "تم إنشاء المشروع",
      description: actionState.projectId
        ? `تم إنشاء المشروع كمسودة فعلية داخل مساحة العمل. رقم المشروع: ${actionState.projectId}.`
        : "تم إنشاء المشروع كمسودة فعلية داخل مساحة العمل.",
      status: "done",
    },
  };
}

function buildFailedCard(
  actionState: Extract<WorkspaceActionState, { type: "create_project" }>,
): AgUiCardDefinition {
  return {
    id: "workspace-project-failed",
    componentId: "execution_result",
    props: {
      title: "تعذر إنشاء المشروع",
      description:
        actionState.error ?? "لم يتمكن المساعد من حفظ المشروع حالياً. راجع البيانات ثم أرسل التحديث المطلوب.",
      status: "blocked",
    },
  };
}

function buildNoAccessTurn(options: WorkspaceAgUiOptions): AgUiConversationTurn {
  return {
    objective: "workspace_capability_check",
    targetZone: "projects",
    action: getActionDefinition("create_project"),
    executionState: "failed",
    assistantText: options.assistantText,
    cards: [
      ...buildAttachmentReceiptCard(options.attachments),
      {
        id: "workspace-no-project-access",
        componentId: "execution_result",
        props: {
          title: "الصلاحية غير متاحة",
          description: "هذا الحساب لا يملك صلاحية إنشاء أو تعديل المشاريع داخل مساحة العمل الحالية.",
          status: "blocked",
        },
      },
    ],
  };
}

function buildAttachmentOnlyTurn(options: WorkspaceAgUiOptions): AgUiConversationTurn {
  return {
    objective: "workspace_attachment_review",
    targetZone: "projects",
    action: getActionDefinition("create_project"),
    executionState: "collecting",
    assistantText: options.assistantText,
    cards: [
      ...buildAttachmentReceiptCard(options.attachments),
      {
        id: "workspace-attachment-followup",
        componentId: "missing_data_prompt",
        props: {
          prompt: "تم حفظ المرفقات في المحادثة. أرسل اسم المشروع والمدينة والحي والسعر المطلوب لأحوّلها إلى مسودة فعلية.",
        },
      },
    ],
  };
}

function buildListTurn(
  actionState: WorkspaceListActionState,
  options: WorkspaceAgUiOptions,
): AgUiConversationTurn {
  const filterCard = buildFilterSummaryCard(actionState.filters);
  const cards: AgUiCardDefinition[] = [
    ...buildAttachmentReceiptCard(options.attachments),
    ...(filterCard ? [filterCard] : []),
    {
      id: `${actionState.type}-data-list`,
      componentId: "data_list",
      props: {
        title: actionState.title,
        items: actionState.items,
        emptyLabel: "لا توجد نتائج مطابقة.",
      },
    },
    {
      id: `${actionState.type}-result`,
      componentId: "execution_result",
      props: {
        title: actionState.title,
        description: actionState.description,
        status: "done",
      },
    },
  ];

  return {
    objective: actionState.type,
    targetZone: actionState.zone,
    action: getActionDefinition(actionState.type),
    executionState: "completed",
    assistantText: options.assistantText,
    cards,
  };
}

function buildDeleteConfirmationTurn(
  actionState: WorkspaceDeleteProjectConfirmationState,
  options: WorkspaceAgUiOptions,
): AgUiConversationTurn {
  const filterCard = buildFilterSummaryCard(actionState.filters);
  const cards: AgUiCardDefinition[] = [
    ...buildAttachmentReceiptCard(options.attachments),
    ...(filterCard ? [filterCard] : []),
    {
      id: "workspace-delete-project-target",
      componentId: "target_summary",
      props: {
        title: "المشروع المحدد",
        description: actionState.description,
        lines: [`اسم المشروع: ${actionState.projectTitle}`, `المعرف: ${actionState.projectId}`],
      },
    },
    {
      id: "workspace-delete-project-status",
      componentId: "execution_result",
      props: {
        title: actionState.state === "completed" ? "تم حذف المشروع" : "بانتظار التأكيد",
        description:
          actionState.state === "completed"
            ? `تم تنفيذ حذف المشروع ${actionState.projectTitle} بنجاح.`
            : "لن يتم تنفيذ الحذف حتى ترسل تأكيداً صريحاً مثل: نعم، أكد الحذف.",
        status: actionState.state === "completed" ? "done" : "blocked",
      },
    },
  ];

  return {
    objective: actionState.type,
    targetZone: actionState.zone,
    action: getActionDefinition("delete_project_confirmation"),
    executionState: actionState.state === "completed" ? "completed" : actionState.state === "failed" ? "failed" : "collecting",
    assistantText: options.assistantText,
    followupQuestion: actionState.state === "collecting" ? "أرسل: نعم، أكد الحذف." : undefined,
    cards,
  };
}

function dedupeCards(cards: AgUiCardDefinition[]) {
  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.id)) {
      return false;
    }
    seen.add(card.id);
    return true;
  });
}

/**
 * WHY:   Workspace AG UI should only render cards backed by real workspace state, not demo heuristics.
 * WHAT:  Builds a conversation turn from current action state, attachments, and role capabilities.
 * HOW:   Emits honest draft, list, confirmation, missing-data, execution-result, and attachment receipt cards.
 */
export function resolveWorkspaceAgUiTurn(options: WorkspaceAgUiOptions): AgUiConversationTurn | null {
  if (!options.actionState) {
    return options.attachments?.length ? buildAttachmentOnlyTurn(options) : null;
  }

  if (options.actionState.type === "create_project" && !hasProjectWriteAccess(options.ownerType)) {
    return buildNoAccessTurn(options);
  }

  if (
    options.actionState.type === "list_clients" ||
    options.actionState.type === "list_projects" ||
    options.actionState.type === "search_projects" ||
    options.actionState.type === "list_offers" ||
    options.actionState.type === "search_offers"
  ) {
    return buildListTurn(options.actionState, options);
  }

  if (options.actionState.type === "delete_project_confirmation") {
    return buildDeleteConfirmationTurn(options.actionState, options);
  }

  const projectActionState = options.actionState as Extract<WorkspaceActionState, { type: "create_project" }>;

  const cards: AgUiCardDefinition[] = [
    ...buildAttachmentReceiptCard(options.attachments),
    buildProjectDraftCard(projectActionState),
  ];

  if (projectActionState.state === "collecting") {
    cards.push(...buildCollectingCards(projectActionState));
  }

  if (projectActionState.state === "completed") {
    cards.push(buildCompletedCard(projectActionState));
  }

  if (projectActionState.state === "failed") {
    cards.push(buildFailedCard(projectActionState));
  }

  if (projectActionState.state === "ready") {
    cards.push({
      id: "workspace-project-ready",
      componentId: "execution_result",
      props: {
        title: "المسودة جاهزة للتنفيذ",
        description: "تم جمع البيانات الأساسية، ويجري الآن تنفيذ الإنشاء الفعلي داخل مساحة العمل.",
        status: "running",
      },
    });
  }

  return {
    objective: projectActionState.type,
    targetZone: "projects",
    action: getActionDefinition("create_project"),
    draft: {
      actionId: "create_project",
      title: toText(projectActionState.fields.name, "مسودة مشروع جديدة"),
      description: toText(projectActionState.fields.description, "مسودة مشروع مشتقة من المحادثة الحالية."),
      fields: {
        name: toText(projectActionState.fields.name, ""),
        city: toText(projectActionState.fields.city, ""),
        district: toText(projectActionState.fields.district, ""),
        price: projectActionState.fields.price ? `${toText(projectActionState.fields.price)}` : "",
        rooms: toText(projectActionState.fields.rooms, ""),
        bathrooms: toText(projectActionState.fields.bathrooms, ""),
        description: toText(projectActionState.fields.description, ""),
      },
      missingFields: [...projectActionState.missingFields],
      zone: "projects",
      state: projectActionState.state,
    },
    executionState: projectActionState.state,
    assistantText: options.assistantText,
    followupQuestion:
      projectActionState.state === "collecting" && projectActionState.missingFields[0]
        ? `أرسل ${projectActionState.missingFields[0]} لإكمال المسودة.`
        : undefined,
    cards: dedupeCards(cards),
  };
}
