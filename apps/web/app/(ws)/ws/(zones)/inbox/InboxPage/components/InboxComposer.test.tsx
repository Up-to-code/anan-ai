import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import InboxComposer, {
  getInboxComposerKeyAction,
  isInboxComposerSendDisabled,
} from "./InboxComposer";

vi.mock("@/lib/uploadthing", () => ({
  useUploadThing: vi.fn(() => ({
    startUpload: vi.fn(async () => []),
    isUploading: false,
  })),
}));

const defaultProps = {
  canUseBusinessActions: false,
  dealOptions: [],
  onCreatePrivateOffer: async () => null,
  onSend: async () => {},
  onShareDeal: async () => {},
  onShareFile: async () => {},
  onShareProject: async () => {},
  projectOptions: [],
};

describe("InboxComposer", () => {
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

  it("renders the collaboration launcher when business actions are enabled", () => {
    const html = renderToStaticMarkup(
      <InboxComposer
        {...defaultProps}
        canUseBusinessActions
        dealOptions={[{ id: "deal-1", title: "Deal", stage: "new" }]}
        projectOptions={[{ id: "project-1", title: "Project", location: "New Cairo", price: 100 }]}
      />,
    );

    expect(html).toContain("مشاركة ملف");
    expect(html).toContain("مشاركة مشروع");
    expect(html).toContain("مشاركة صفقة");
    expect(html).toContain("عرض خاص");
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
});
