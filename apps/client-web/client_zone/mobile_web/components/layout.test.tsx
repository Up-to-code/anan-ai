import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResponsiveBuyerShell, ResponsiveHistoryPanel } from "./layout";

describe("ResponsiveBuyerShell", () => {
  it("renders the desktop split-view container and optional rail slot", () => {
    const markup = renderToStaticMarkup(
      <ResponsiveBuyerShell
        header={<div>header</div>}
        main={<div>main</div>}
        desktopRail={<div>rail</div>}
        mobileBottomBar={<div>bottom</div>}
      />,
    );

    expect(markup).toContain("data-testid=\"client-responsive-shell\"");
    expect(markup).toContain("lg:grid-cols-[minmax(0,1fr)_360px]");
    expect(markup).toContain("data-testid=\"client-responsive-shell-rail\"");
    expect(markup).toContain("lg:hidden");
  });
});

describe("ResponsiveHistoryPanel", () => {
  const threads = [
    {
      id: "thread-1",
      title: "محادثة تجريبية",
      createdAt: 1,
      updatedAt: 1,
      preview: "ملخص سريع للمحادثة",
    },
  ];

  it("renders the inline desktop panel variant", () => {
    const markup = renderToStaticMarkup(
      <ResponsiveHistoryPanel
        mode="inline"
        activeThreadId="thread-1"
        threads={threads}
        onReset={() => {}}
        onSelect={() => {}}
      />,
    );

    expect(markup).toContain("data-testid=\"client-history-panel-inline\"");
    expect(markup).toContain("محادثة جديدة");
    expect(markup).toContain("محادثة تجريبية");
  });

  it("renders the mobile sheet variant only when open", () => {
    const markup = renderToStaticMarkup(
      <ResponsiveHistoryPanel
        mode="sheet"
        open
        activeThreadId="thread-1"
        threads={threads}
        onClose={() => {}}
        onReset={() => {}}
        onSelect={() => {}}
      />,
    );

    expect(markup).toContain("data-testid=\"client-history-panel-sheet\"");
    expect(markup).toContain("سجل المحادثات");
  });
});
