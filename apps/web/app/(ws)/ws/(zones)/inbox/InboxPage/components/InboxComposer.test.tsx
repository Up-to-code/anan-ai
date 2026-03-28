import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import InboxComposer, {
  getInboxComposerKeyAction,
  isInboxComposerSendDisabled,
} from "./InboxComposer";
import {
  InboxOfferModal,
  InboxQuickShareMenu,
} from "./InboxComposerActions";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => []),
}));

vi.mock("@/lib/uploadthing", () => ({
  useUploadThing: vi.fn(() => ({
    startUpload: vi.fn(async () => []),
    isUploading: false,
  })),
}));

const defaultProps = {
  activeShareAction: null,
  canUseBusinessActions: false,
  conversation: {
    id: "conversation-1",
    directKey: "auth-a__auth-b",
    updatedAt: Date.now(),
    unreadCount: 0,
    lastMessagePreview: "",
    lastMessage: null,
    otherUser: {
      id: "auth-b",
      name: "Broker B",
      email: "b@example.com",
      username: "broker-b",
      role: "broker",
      brokerId: "broker-1",
      redId: null,
      organizationName: "Elite Brokers",
      organizationType: "broker",
      membershipState: null,
      conversationId: "conversation-1",
      image: null,
    },
    messages: [],
  },
  onCreatePrivateOfferDraft: async () => null,
  onPublishConversationOffer: async () => null,
  onSend: async () => {},
  onShareActionChange: () => {},
  onShareFile: async () => {},
  onShareProject: async () => {},
  projectOptions: [],
};

it("renders a disabled send button for blank drafts", () => {
  const html = renderToStaticMarkup(<InboxComposer {...defaultProps} />);

  expect(html).toContain("disabled=\"\"");
  expect(html).toContain("إرسال");
});

it("renders the sending label while a message is being sent", () => {
  const html = renderToStaticMarkup(
    <InboxComposer {...defaultProps} initialValue="مرحبا" isSending />,
  );

  expect(html).toContain("جاري الإرسال");
  expect(html).toContain("disabled=\"\"");
});

it("renders the compact share menu options", () => {
  const html = renderToStaticMarkup(
    <InboxQuickShareMenu
      activeAction={null}
      canCreateOffer
      canShareProjects
      onSelectAction={() => {}}
    />,
  );

  expect(html).toContain("إنشاء عرض خاص");
  expect(html).toContain("إرسال عقار أو شقة");
  expect(html).toContain("إرفاق ملف");
});

it("renders explicit disabled guidance for unavailable quick actions", () => {
  const html = renderToStaticMarkup(
    <InboxQuickShareMenu
      activeAction={null}
      canCreateOffer={false}
      canShareProjects={false}
      onSelectAction={() => {}}
    />,
  );

  expect(html).toContain("تحتاج إلى مشروع واحد على الأقل");
  expect(html).toContain("أضف مشروعًا أولًا");
});

it("renders the offer modal with the simplified quick-send copy", () => {
  const html = renderToStaticMarkup(
    <InboxOfferModal
      conversationLabel="Broker B"
      fileInputRef={{ current: null }}
      handleUploadOfferAttachments={async () => {}}
      handleSelectOfferProject={() => {}}
      isOpen
      isSending={false}
      isUploading={false}
      offerForm={{
        propertyId: "project-1",
        title: "عرض خاص",
        description: "",
        price: "1000",
        attachments: [],
      }}
      onClose={() => {}}
      onSubmit={async () => {}}
      projectOptions={[{ id: "project-1", title: "Project", location: "New Cairo", price: 100 }]}
      setOfferForm={() => {}}
    />,
  );

  expect(html).toContain("إنشاء وإرسال عرض سريع");
  expect(html).toContain("سيتم إنشاء العرض ثم إرساله مباشرة داخل المحادثة.");
});

it("marks enter without shift as a send action", () => {
  expect(getInboxComposerKeyAction("Enter", false)).toBe("send");
});

it("keeps shift-enter available for a newline", () => {
  expect(getInboxComposerKeyAction("Enter", true)).toBe("none");
});

it("keeps send disabled for whitespace-only drafts", () => {
  expect(isInboxComposerSendDisabled("   ")).toBe(true);
  expect(isInboxComposerSendDisabled("مرحبا")).toBe(false);
});
