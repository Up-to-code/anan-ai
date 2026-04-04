import type { AdminNavGroup } from "@/lib/adminNavigation";

export type AdminSidebarGroupState = Record<string, boolean>;

/**
 * WHY:   The sidebar should feel predictable across page loads and still reveal the active section when users return.
 * WHAT:  Builds the initial open/closed state for every sidebar group.
 * HOW:   Seeds the state from each group's default behavior and force-opens the group containing the current route.
 */
export function resolveAdminSidebarGroupState(groups: AdminNavGroup[], pathname: string, storedState?: Partial<AdminSidebarGroupState> | null) {
  const activeGroupId =
    groups.find((group) =>
      group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
    )?.id ?? null;

  return groups.reduce<AdminSidebarGroupState>((accumulator, group) => {
    const storedValue = storedState?.[group.id];
    accumulator[group.id] = group.id === activeGroupId
      ? true
      : typeof storedValue === "boolean"
        ? storedValue
        : group.defaultOpen;
    return accumulator;
  }, {});
}
