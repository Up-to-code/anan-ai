import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import MembersWorkspace from "./MembersWorkspace";

vi.mock("@base-ui/react/dialog", () => ({
  Dialog: {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <button className={className}>{children}</button>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Backdrop: ({ className }: { className?: string }) => <div className={className} />,
    Popup: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    Close: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <button className={className}>{children}</button>
    ),
  },
}));

vi.mock("./InviteMemberForm", () => ({
  default: () => <div>INVITE-FORM</div>,
}));

describe("MembersWorkspace", () => {
  it("renders member cards with manager role actions", () => {
    const markup = renderToStaticMarkup(
      <MembersWorkspace
        initialMembers={[
          {
            id: "member-1",
            authUserId: "auth-1",
            membershipId: "membership-1",
            name: "سارة العتيبي",
            email: "sara@example.com",
            role: "manager",
            statusLabel: "نشط",
          },
        ]}
        invites={[]}
        canManage
        hasOrganization
        organizationType="broker"
        onCreateInvite={vi.fn(async () => ({ ok: true as const, message: "ok", inviteId: "invite-1" }))}
        onCancelInvite={vi.fn(async () => ({ ok: true as const, message: "ok" }))}
        onSearchDirectory={vi.fn(async () => ({ ok: true as const, results: [] }))}
        onUpdateRole={vi.fn(async () => ({ ok: true as const, message: "ok" }))}
      />,
    );

    expect(markup).toContain("سارة العتيبي");
    expect(markup).toContain("نشط");
    expect(markup).toContain("مدير");
    expect(markup).toContain("عضو");
    expect(markup).toContain("مشاهد");
    expect(markup).toContain("دعوة عضو");
  });

  it("keeps pending invites in a separate list section", () => {
    const markup = renderToStaticMarkup(
      <MembersWorkspace
        initialMembers={[
          {
            id: "member-1",
            authUserId: "auth-1",
            membershipId: "membership-1",
            name: "أحمد علي",
            email: "ahmed@example.com",
            role: "member",
            statusLabel: "نشط",
          },
        ]}
        invites={[
          {
            id: "invite-1",
            email: "new@example.com",
            role: "viewer",
            status: "pending",
            expiresLabel: "01/01/2026",
          },
        ]}
        canManage
        hasOrganization
        organizationType="red"
        onCreateInvite={vi.fn(async () => ({ ok: true as const, message: "ok", inviteId: "invite-1" }))}
        onCancelInvite={vi.fn(async () => ({ ok: true as const, message: "ok" }))}
        onSearchDirectory={vi.fn(async () => ({ ok: true as const, results: [] }))}
        onUpdateRole={vi.fn(async () => ({ ok: true as const, message: "ok" }))}
      />,
    );

    expect(markup).toContain("الدعوات المعلقة (1)");
    expect(markup).toContain("new@example.com");
    expect(markup).toContain("إلغاء");
    expect(markup).toContain("مشاهد");
    expect(markup).toContain("01/01/2026");
  });
});
