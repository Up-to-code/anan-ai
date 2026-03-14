"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import { useId, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import type { SidebarUser } from "@/components/shared/Sidebar/types";
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
        className="inline-flex h-12 w-12 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/60 lg:hidden" />

          <Dialog.Popup
            id={drawerId}
            data-slot="workspace-sidebar-mobile-drawer"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,100vw)] max-w-full outline-none lg:hidden"
          >
            <Dialog.Title id={dialogTitleId} className="sr-only">
              تنقل مساحة العمل
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              القائمة الرئيسية الخاصة بمنطقة العمل الحالية.
            </Dialog.Description>

            <div className="relative flex h-full w-full">
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
                className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-none border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
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
