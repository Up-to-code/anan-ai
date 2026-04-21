import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const { useConvexAuth, useQuery } = vi.hoisted(() => ({
  useConvexAuth: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useConvexAuth,
  useQuery,
}));

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
  beforeEach(() => {
    useConvexAuth.mockReset();
    useQuery.mockReset();
  });

  it("skips protected queries until Convex auth is ready", () => {
    useConvexAuth.mockReturnValue({ isLoading: true, isAuthenticated: false });
    useQuery.mockReturnValue(undefined);

    const markup = renderToStaticMarkup(
      <HookHarness initialCounts={{ notificationCount: 3, inboxCount: 4 }} />,
    );

    expect(useQuery).toHaveBeenCalledTimes(2);
    expect(useQuery.mock.calls[0]?.[1]).toBe("skip");
    expect(useQuery.mock.calls[1]?.[1]).toBe("skip");
    expect(markup).toContain("&quot;notificationCount&quot;:3");
    expect(markup).toContain("&quot;inboxCount&quot;:4");
  });

  it("subscribes once authenticated and prefers live counts", () => {
    useConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
    useQuery.mockReturnValueOnce({ unreadCount: 9 });
    useQuery.mockReturnValueOnce({ unreadCount: 2 });

    const markup = renderToStaticMarkup(
      <HookHarness initialCounts={{ notificationCount: 1, inboxCount: 1 }} />,
    );

    expect(useQuery).toHaveBeenCalledTimes(2);
    expect(useQuery.mock.calls[0]?.[1]).toEqual({});
    expect(useQuery.mock.calls[1]?.[1]).toEqual({});
    expect(markup).toContain("&quot;notificationCount&quot;:9");
    expect(markup).toContain("&quot;inboxCount&quot;:2");
  });
});
