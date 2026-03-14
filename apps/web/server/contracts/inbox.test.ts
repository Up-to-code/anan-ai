import { describe, expect, it } from "vitest";
import {
  conversationMessageSchema,
  createPrivateOfferInConversationInputSchema,
  dealShareMetadataSchema,
  fileShareMetadataSchema,
  inviteEventMetadataSchema,
  projectShareMetadataSchema,
  roleEventMetadataSchema,
} from "./inbox";

const baseActor = {
  authUserId: "auth-a",
  name: "Ahmed",
  role: "broker" as const,
  organizationId: "broker-1",
  organizationType: "broker" as const,
  organizationName: "Elite Brokers",
};

const baseRecipient = {
  recipientAuthUserId: "auth-b",
  organizationId: "red-1",
  organizationType: "developer" as const,
  organizationName: "Skyline RED",
};

describe("inbox contracts", () => {
  it("validates file share metadata", () => {
    expect(
      fileShareMetadataSchema.parse({
        contextType: "file_share",
        actor: baseActor,
        recipient: baseRecipient,
        title: "عرض سعر محدث",
        summary: "ملف PDF جديد",
        href: "/ws/files/file-1",
        action: { type: "open_file", label: "افتح الملف", href: "/ws/files/file-1" },
        file: {
          key: "file-1",
          url: "https://files.test/file-1.pdf",
          name: "price-sheet.pdf",
          mime: "application/pdf",
        },
      }),
    ).toBeTruthy();
  });

  it("validates project, deal, invite, and role event metadata", () => {
    expect(
      projectShareMetadataSchema.parse({
        contextType: "project_share",
        actor: baseActor,
        recipient: baseRecipient,
        title: "مشروع جديد",
        summary: "أرسلت لك هذا المشروع للمراجعة",
        href: "/ws/projects/property-1",
        action: { type: "open_project", label: "افتح المشروع", href: "/ws/projects/property-1" },
        propertyId: "property-1",
      }),
    ).toBeTruthy();

    expect(
      dealShareMetadataSchema.parse({
        contextType: "deal_share",
        actor: baseActor,
        recipient: baseRecipient,
        title: "صفقة متابعة",
        summary: "راجع حالة التفاوض الحالية",
        href: "/ws/crm/deals/deal-1",
        action: { type: "open_deal", label: "افتح الصفقة", href: "/ws/crm/deals/deal-1" },
        dealId: "deal-1",
        stage: "negotiation",
      }),
    ).toBeTruthy();

    expect(
      inviteEventMetadataSchema.parse({
        contextType: "invite_event",
        actor: baseActor,
        recipient: baseRecipient,
        title: "دعوة فريق",
        summary: "تم قبول الدعوة",
        href: "/ws/settings/members",
        action: { type: "open_invite", label: "افتح الدعوة", href: "/ws/settings/members" },
        inviteId: "invite-1",
        inviteRole: "member",
        inviteStatus: "accepted",
        organizationName: "Skyline RED",
        organizationType: "developer",
      }),
    ).toBeTruthy();

    expect(
      roleEventMetadataSchema.parse({
        contextType: "role_event",
        actor: baseActor,
        recipient: baseRecipient,
        title: "تحديث الدور",
        summary: "تمت ترقية العضو إلى مدير",
        href: "/ws/settings/members",
        action: { type: "open_membership", label: "افتح العضوية", href: "/ws/settings/members" },
        membershipId: "membership-1",
        organizationRole: "manager",
        previousRole: "member",
        organizationName: "Skyline RED",
        organizationType: "developer",
      }),
    ).toBeTruthy();
  });

  it("validates typed conversation messages", () => {
    expect(
      conversationMessageSchema.parse({
        id: "message-1",
        senderUserId: "auth-a",
        recipientUserId: "auth-b",
        type: "file_share",
        body: "تمت مشاركة ملف جديد",
        createdAt: Date.now(),
        metadata: {
          contextType: "file_share",
          actor: baseActor,
          recipient: baseRecipient,
          title: "عرض سعر محدث",
          summary: "ملف PDF جديد",
          href: "/ws/files/file-1",
          action: { type: "open_file", label: "افتح الملف", href: "/ws/files/file-1" },
          file: {
            key: "file-1",
            url: "https://files.test/file-1.pdf",
            name: "price-sheet.pdf",
          },
        },
      }),
    ).toBeTruthy();
  });

  it("requires the targeted private-offer conversation payload", () => {
    expect(
      createPrivateOfferInConversationInputSchema.safeParse({
        conversationId: "conversation-1",
        propertyId: "property-1",
        price: 1000000,
      }).success,
    ).toBe(true);

    expect(
      createPrivateOfferInConversationInputSchema.safeParse({
        propertyId: "property-1",
        price: 1000000,
      }).success,
    ).toBe(false);
  });
});
