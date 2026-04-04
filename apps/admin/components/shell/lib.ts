/**
 * WHY:   The admin shell needs one shared width token so the rail and content column stay aligned during collapse transitions.
 * WHAT:  Exports the desktop width class used by the expanded admin sidebar.
 * HOW:   Mirrors the workspace-shell sizing approach while keeping the value admin-local.
 */
export const ADMIN_SIDEBAR_WIDTH_CLASS = "w-[17rem]";
