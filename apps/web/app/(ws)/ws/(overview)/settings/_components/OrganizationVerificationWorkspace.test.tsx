import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("@/lib/uploadthing", () => ({
  useUploadThing: vi.fn(() => ({
    startUpload: vi.fn(async () => []),
    isUploading: false,
  })),
}));

import OrganizationVerificationWorkspace from "./OrganizationVerificationWorkspace";

it("renders manager submission controls without admin-only review actions", () => {
  const markup = renderToStaticMarkup(
    <OrganizationVerificationWorkspace
      organization={{
        id: "broker-1",
        type: "broker",
        name: "منظمة ألف",
        slug: "alpha",
        status: "active",
        isVerified: false,
      }}
      verificationSummary={{
        isVerified: false,
        currentRequestId: "request-1",
        currentRequestStatus: "in_review",
        lastSubmittedAt: Date.now(),
        lastReviewedAt: null,
        reviewerNotes: null,
        documentsCount: 1,
        publishingBlocked: true,
        attachedDocuments: [],
        requirements: [],
        sourceUrls: [],
      }}
      ruleset={{
        _id: "ruleset-1",
        countryCode: "SA",
        countryLabel: "السعودية",
        orgType: "broker",
        status: "active",
        version: 1,
        requirements: [{ id: "license", label: "السجل التجاري", required: true }],
        sources: [{ id: "source-1", label: "مرجع", url: "https://example.com" }],
        enforcement: {
          blockPublish: true,
          hideUnverified: false,
          showBanner: true,
          requireOrgVerification: true,
          requireListingVerification: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }}
      canManage
      membersCount={3}
    />,
  );

  expect(markup).toContain("عدد الأعضاء");
  expect(markup).toContain(">3<");
  expect(markup).toContain("إرسال أو إعادة إرسال مستندات التوثيق");
  expect(markup).toContain("لا توجد أي أزرار اعتماد أو إغلاق هنا");
  expect(markup).toContain("إعادة إرسال المستندات");
  expect(markup).not.toContain("اعتماد المنظمة");
  expect(markup).not.toContain("إغلاق التوثيق");
});
