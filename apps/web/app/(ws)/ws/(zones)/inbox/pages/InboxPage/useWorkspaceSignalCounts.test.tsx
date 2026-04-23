import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useWorkspaceSignalCounts } from "./useWorkspaceSignalCounts";

function HookHarness({
  initialCounts,
}: {
  initialCounts: { notificationCount: number; inboxCount: number };
}) {
  const counts = useWorkspaceSignalCounts(initialCounts);
  return <output>{JSON.stringify(counts)}</output>;
}

describe("useWorkspaceSignalCounts", () => {
  it("renders server-provided counts without client subscriptions", () => {
    const markup = renderToStaticMarkup(
      <HookHarness initialCounts={{ notificationCount: 3, inboxCount: 4 }} />,
    );

    expect(markup).toContain("&quot;notificationCount&quot;:3");
    expect(markup).toContain("&quot;inboxCount&quot;:4");
  });

  it("updates when the parent provides new server counts", () => {
    const markup = renderToStaticMarkup(
      <HookHarness initialCounts={{ notificationCount: 9, inboxCount: 2 }} />,
    );

    expect(markup).toContain("&quot;notificationCount&quot;:9");
    expect(markup).toContain("&quot;inboxCount&quot;:2");
  });
});
