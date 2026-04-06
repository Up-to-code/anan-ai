/**
 * WHY:   The admin shell needs one shared width token so the rail and content column stay aligned during collapse transitions.
 * WHAT:  Exports the shell sizing tokens used by the sidebar, top bar, and sticky rails.
 * HOW:   Keeps the dashboard frame synchronized around one set of admin-local dimensions.
 */
export const ADMIN_SIDEBAR_EXPANDED_WIDTH_CLASS = "w-80";
export const ADMIN_SIDEBAR_COLLAPSED_WIDTH_CLASS = "w-14";
export const ADMIN_TOPBAR_HEIGHT_CLASS = "h-[4.5rem]";
export const ADMIN_STICKY_RAIL_TOP_CLASS = "xl:top-[5.5rem]";
export const ADMIN_STICKY_RAIL_MAX_HEIGHT_CLASS = "xl:max-h-[calc(100dvh-5.5rem)]";
