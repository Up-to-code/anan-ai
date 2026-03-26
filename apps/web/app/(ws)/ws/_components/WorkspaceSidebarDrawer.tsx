"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import { useId, useState } from "react";
import Sidebar from "./Sidebar";
import type { SidebarUser } from "./Sidebar/types";
import type { WorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";

/**
 * WHY:   Small screens need reliable access to workspace navigation without depending on the desktop sidebar rail.
 * WHAT:  Renders the mobile nav trigger plus an accessible slide-in drawer containing the shared sidebar.
 * HOW:   Controls a Base UI dialog locally and closes it on backdrop, escape, close-button, or link navigation.
 */
export default function WorkspaceSidebarDrawer({
  user,
  organization,
  visibleZoneKeys,
  recentAssistantThreads = [],
  allAssistantThreads = [],
}: {
  user: SidebarUser;
  organization: WorkspaceOrganizationDisplay;
  visibleZoneKeys?: WorkspaceZoneKey[];
  recentAssistantThreads?: AnanProThreadSummary[];
  allAssistantThreads?: AnanProThreadSummary[];
}) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const dialogTitleId = useId();
  const sidebarTitleId = useId();

  return (
    <>
      <button
        type="button"
        aria-label="فتح قائمة التنقل"
        aria-expanded={open}
        aria-controls={drawerId}
        data-slot="workspace-sidebar-trigger"
        className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] shadow-sm transition-all hover:bg-[var(--workspace-accent-soft)] hover:text-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] active:scale-95"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 lg:hidden"
          />

          <Dialog.Popup
            id={drawerId}
            data-slot="workspace-sidebar-mobile-drawer"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,100vw)] max-w-full outline-none transition-transform duration-300 ease-out data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full lg:hidden"
          >
            <Dialog.Title id={dialogTitleId} className="sr-only">
              تنقل مساحة العمل
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              القائمة الرئيسية الخاصة بمنطقة العمل الحالية.
            </Dialog.Description>

            <div className="relative flex h-full w-full shadow-2xl shadow-black/45">
              <Sidebar
                user={user}
                organization={organization}
                visibleZoneKeys={visibleZoneKeys}
                recentAssistantThreads={recentAssistantThreads}
                allAssistantThreads={allAssistantThreads}
                mode="drawer"
                titleId={sidebarTitleId}
                onNavigate={() => setOpen(false)}
                className="h-full w-full"
              />

              <Dialog.Close
                aria-label="إغلاق القائمة"
                className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/10 bg-black/20 text-white/75 backdrop-blur-sm transition-all hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_30%,transparent)] hover:bg-black/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] active:scale-95"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
