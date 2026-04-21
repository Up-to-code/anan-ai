import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentProps } from "react";
import { expect, it, vi } from "vitest";
import InboxThreadView from "./InboxThreadView";
import { getInboxThreadMenuActionLabels } from "./components/InboxThreadHeader";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => null),
  useConvexAuth: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
  })),
}));

vi.mock("@/lib/uploadthing", () => ({
  useUploadThing: vi.fn(() => ({
    startUpload: vi.fn(async () => []),
    isUploading: false,
  })),
}));

const baseConversation = {
  id: "conversation-1",
  directKey: "auth-a__auth-b",
  updatedAt: Date.now(),
  unreadCount: 0,
  otherParticipantLastReadAt: null,
  lastMessagePreview: "مرحبا",
  lastMessage: null,
  otherUser: {
    id: "auth-b",
    name: "User B",
    email: "b@example.com",
    username: "user-b",
    role: "user",
    brokerId: null,
    redId: null,
    organizationName: null,
    organizationType: null,
    membershipState: null,
    conversationId: "conversation-1",
    image: null,
  },
  messages: [],
};

type ThreadProps = ComponentProps<typeof InboxThreadView>;

type ConversationOverride = Partial<ThreadProps["conversation"]>;

const baseProps: Omit<ThreadProps, "conversation"> = {
  canUseBusinessActions: false,
  currentUserId: "auth-a",
  isArchivingConversation: false,
  isSidebarCollapsed: false,
  isSending: false,
  onCreatePrivateOfferDraft: async () => null,
  onSend: async () => {},
  onPublishConversationOffer: async () => null,
  onRespondToConversationOffer: async () => null,
  onSetConversationArchived: async () => {},
  onShareFile: async () => {},
  onShareProject: async () => {},
  onToggleSidebarCollapsed: () => {},
  projectOptions: [],
};

const offerEventConversation: ConversationOverride = {
  unreadCount: 1,
  lastMessagePreview: "تم إرسال عرض جديد",
  otherUser: {
    ...baseConversation.otherUser,
    id: "auth-a",
    name: "Broker A",
    email: "a@example.com",
    username: "broker-a",
    role: "broker",
    brokerId: "broker-1",
    redId: null,
    organizationName: "Elite Brokers",
    organizationType: "broker",
    membershipState: null,
    conversationId: "conversation-1",
    image: null,
  },
  messages: [
    {
      id: "offer-event-1",
      senderUserId: "auth-a",
      recipientUserId: "auth-b",
      type: "offer_event" as const,
      body: "نبدأ الحديث حول بالم هيلز",
      createdAt: Date.now(),
      metadata: {
        contextType: "offer_card",
        bootstrapSource: "offer_detail",
        offerId: "offer-1",
        propertyId: "property-1",
        offerTitle: "بالم هيلز",
        authorName: "Broker A",
        organizationName: "Elite Brokers",
        price: 950000,
        visibility: "public",
        href: "/ws/offers/offer-1",
      },
    },
  ],
};

const collaborationCardConversation: ConversationOverride = {
  messages: [
    {
      id: "file-event-1",
      senderUserId: "auth-a",
      recipientUserId: "auth-b",
      type: "file_share" as const,
      body: "تمت مشاركة الملف",
      createdAt: Date.now(),
      metadata: {
        contextType: "file_share",
        actor: {
          authUserId: "auth-a",
          name: "Broker A",
          role: "broker",
          organizationId: "broker-1",
          organizationType: "broker",
          organizationName: "Elite Brokers",
        },
        recipient: {
          recipientAuthUserId: "auth-b",
          organizationId: "red-1",
          organizationType: "developer",
          organizationName: "Palm Hills",
        },
        title: "Scope.pdf",
        summary: "مرفق الاتفاق",
        href: "https://files.example.com/scope.pdf",
        action: {
          type: "open_file",
          label: "افتح الملف",
          href: "https://files.example.com/scope.pdf",
        },
        file: {
          key: "file-1",
          url: "https://files.example.com/scope.pdf",
          name: "Scope.pdf",
        },
      },
    },
  ],
};

const collaborationCardProps: Partial<Omit<ThreadProps, "conversation">> = {
  canUseBusinessActions: true,
  currentUserId: "auth-b",
  projectOptions: [{ id: "project-1", title: "Palm Hills", location: "New Cairo" }],
};

function renderThreadView(
  propsOverride: Partial<Omit<ThreadProps, "conversation">> = {},
  conversationOverride: ConversationOverride = {},
) {
  return renderToStaticMarkup(
    <InboxThreadView
      {...baseProps}
      {...propsOverride}
      conversation={{
        ...baseConversation,
        ...conversationOverride,
      }}
    />,
  );
}

it("renders optimistic messages with a sending label", () => {
  const html = renderThreadView({}, {
    messages: [
      {
        id: "optimistic-1",
        senderUserId: "auth-a",
        recipientUserId: "auth-b",
        type: "text" as const,
        body: "مرحبا",
        createdAt: Date.now(),
        metadata: { optimistic: true },
      },
    ],
  });

  expect(html).toContain("مرحبا");
  expect(html).toContain("جاري الإرسال");
  expect(html).toContain("flex h-full min-h-0 flex-1 basis-0 flex-col bg-[var(--workspace-canvas)] text-foreground");
});

it("shows seen state on the latest outgoing message once the other participant reads it", () => {
  const createdAt = Date.now() - 5_000;
  const html = renderThreadView({}, {
    otherParticipantLastReadAt: createdAt + 2_000,
    messages: [
      {
        id: "message-1",
        senderUserId: "auth-a",
        recipientUserId: "auth-b",
        type: "text" as const,
        body: "تمت المراجعة",
        createdAt,
        metadata: null,
      },
    ],
  });

  expect(html).toContain("تمت المراجعة");
  expect(html).toContain("شوهد");
});

it("renders offer event messages as structured offer cards", () => {
  const html = renderThreadView({ currentUserId: "auth-b" }, offerEventConversation);

  expect(html).toContain("عرض خاص");
  expect(html).toContain("بالم هيلز");
  expect(html).toContain("Elite Brokers");
  expect(html).toContain("950,000");
  expect(html).toContain("افتح العرض");
});

it("renders the mobile back affordance when requested", () => {
  const html = renderThreadView({ onBack: () => {}, showBackButton: true });
  expect(html).toContain("aria-label=\"العودة إلى قائمة المحادثات\"");
});

it("renders the simplified header identity with organization and participant type", () => {
  const html = renderThreadView({}, offerEventConversation);

  expect(html).toContain("Broker A");
  expect(html).toContain("Elite Brokers");
  expect(html).toContain("وسيط");
  expect(html).toContain("aria-label=\"إجراءات\"");
});

it("exposes the expected compact header actions when business actions are enabled", () => {
  expect(
    getInboxThreadMenuActionLabels({
      canCreateOffer: true,
      canShareProjects: true,
      canUseBusinessActions: true,
      isArchived: false,
    }),
  ).toEqual(["إنشاء عرض خاص", "إرسال عقار أو شقة", "إرفاق ملف", "نقل إلى الأرشيف"]);
});

it("renders collaboration cards with their deep-link action", () => {
  const html = renderThreadView(collaborationCardProps, collaborationCardConversation);

  expect(html).toContain("Scope.pdf");
  expect(html).toContain("افتح الملف");
  expect(html).toContain("اكتب رسالتك");
});
