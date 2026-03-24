import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentProps } from "react";
import { expect, it, vi } from "vitest";
import InboxThreadView from "./InboxThreadView";

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
  },
  messages: [],
};

type ThreadProps = ComponentProps<typeof InboxThreadView>;

type ConversationOverride = Partial<ThreadProps["conversation"]>;

const baseProps: Omit<ThreadProps, "conversation"> = {
  canUseBusinessActions: false,
  currentUserId: "auth-a",
  dealOptions: [],
  isSending: false,
  onCreatePrivateOffer: async () => null,
  onSend: async () => {},
  onShareDeal: async () => {},
  onShareFile: async () => {},
  onShareProject: async () => {},
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
  dealOptions: [{ id: "deal-1", title: "Deal A", stage: "new" }],
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
});

it("renders offer event messages as structured offer cards", () => {
  const html = renderThreadView({ currentUserId: "auth-b" }, offerEventConversation);

  expect(html).toContain("بطاقة عرض");
  expect(html).toContain("بالم هيلز");
  expect(html).toContain("Elite Brokers");
  expect(html).toContain("950,000");
  expect(html).toContain("افتح العرض");
});

it("renders the mobile back affordance when requested", () => {
  const html = renderThreadView({ onBack: () => {}, showBackButton: true });
  expect(html).toContain("aria-label=\"العودة إلى قائمة المحادثات\"");
});

it("renders collaboration cards with their deep-link action", () => {
  const html = renderThreadView(collaborationCardProps, collaborationCardConversation);

  expect(html).toContain("مشاركة ملف");
  expect(html).toContain("Scope.pdf");
  expect(html).toContain("افتح الملف");
  expect(html).toContain("مشاركة مشروع");
});
