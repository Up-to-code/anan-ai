import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import ApiKeysWorkspace from "./ApiKeysWorkspace";

vi.mock("@base-ui/react/dialog", () => ({
  Dialog: {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children, className }: { children: React.ReactNode; className?: string }) => <button className={className}>{children}</button>,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Backdrop: ({ className }: { className?: string }) => <div className={className} />,
    Popup: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
    Title: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
    Close: ({ children, className }: { children: React.ReactNode; className?: string }) => <button className={className}>{children}</button>,
  },
}));

it("renders the centralized api key permission catalog in the picker", () => {
  const markup = renderToStaticMarkup(
    <ApiKeysWorkspace
      initialKeys={[]}
      canCreate
      canRevoke
      canView
      hasOrganization
      onCreateKey={vi.fn(async () => ({ ok: false as const, message: "no-op" }))}
      onRevokeKey={vi.fn(async () => ({ ok: true as const, message: "ok" }))}
    />,
  );

  expect(markup).toContain("العملاء");
  expect(markup).toContain("العقارات");
  expect(markup).toContain("الصفقات");
  expect(markup).toContain("الوسطاء");
  expect(markup).toContain("قراءة");
  expect(markup).toContain("إنشاء");
  expect(markup).toContain("تحديث");
  expect(markup).toContain("حذف");
});
