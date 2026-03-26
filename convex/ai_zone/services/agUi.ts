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
  RED: ["projects", "offers", "market"],
  user: ["market"],
};

const CREATE_PROJECT_ACTION: AgUiConversationTurn["action"] = {
  id: "create_project",
  title: "إنشاء مشروع",
  zone: "projects",
  fields: ["name", "city", "district", "price", "rooms", "bathrooms", "description"],
};

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
    action: CREATE_PROJECT_ACTION,
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
    action: CREATE_PROJECT_ACTION,
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
 * HOW:   Emits only honest draft, missing-data, execution-result, and attachment receipt cards.
 */
export function resolveWorkspaceAgUiTurn(options: WorkspaceAgUiOptions): AgUiConversationTurn | null {
  if (!options.actionState) {
    return options.attachments?.length ? buildAttachmentOnlyTurn(options) : null;
  }

  if (options.actionState.type === "create_project" && !hasProjectWriteAccess(options.ownerType)) {
    return buildNoAccessTurn(options);
  }

  if (options.actionState.type !== "create_project") {
    return options.attachments?.length ? buildAttachmentOnlyTurn(options) : null;
  }

  const cards: AgUiCardDefinition[] = [
    ...buildAttachmentReceiptCard(options.attachments),
    buildProjectDraftCard(options.actionState),
  ];

  if (options.actionState.state === "collecting") {
    cards.push(...buildCollectingCards(options.actionState));
  }

  if (options.actionState.state === "completed") {
    cards.push(buildCompletedCard(options.actionState));
  }

  if (options.actionState.state === "failed") {
    cards.push(buildFailedCard(options.actionState));
  }

  if (options.actionState.state === "ready") {
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
    objective: options.actionState.type,
    targetZone: "projects",
    action: CREATE_PROJECT_ACTION,
    draft: {
      actionId: "create_project",
      title: toText(options.actionState.fields.name, "مسودة مشروع جديدة"),
      description: toText(options.actionState.fields.description, "مسودة مشروع مشتقة من المحادثة الحالية."),
      fields: {
        name: toText(options.actionState.fields.name, ""),
        city: toText(options.actionState.fields.city, ""),
        district: toText(options.actionState.fields.district, ""),
        price: options.actionState.fields.price ? `${toText(options.actionState.fields.price)}` : "",
        rooms: toText(options.actionState.fields.rooms, ""),
        bathrooms: toText(options.actionState.fields.bathrooms, ""),
        description: toText(options.actionState.fields.description, ""),
      },
      missingFields: [...options.actionState.missingFields],
      zone: "projects",
      state: options.actionState.state,
    },
    executionState: options.actionState.state,
    assistantText: options.assistantText,
    followupQuestion:
      options.actionState.state === "collecting" && options.actionState.missingFields[0]
        ? `أرسل ${options.actionState.missingFields[0]} لإكمال المسودة.`
        : undefined,
    cards: dedupeCards(cards),
  };
}
