"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNavGroups, docsPages } from "@/lib/docs/registry";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="border-r border-slate-100 bg-white dark:border-white/10 dark:bg-[#09090b]">
      <SidebarHeader className="p-6 pb-2">
        <Link href="/" className="text-base font-black tracking-widest uppercase text-slate-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
          Anan API Docs
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        {docsNavGroups.map((group) => (
          <SidebarGroup key={group.id} className="mb-8 px-0">
            <SidebarGroupLabel className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {group.items.map((pageKey) => {
                  const page = docsPages[pageKey];
                  if (!page) return null;
                  const isActive = pathname === page.href;
                  return (
                    <SidebarMenuItem key={page.key}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={page.title}
                        render={<Link href={page.href} />}
                        className={`h-auto rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
                          isActive 
                            ? "bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-500/10"
                            : "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                        }`}
                      >
                        <span className="flex-1 truncate">{page.title}</span>
                        {page.pageType === "api" ? (
                          <span className="ml-2 rounded flex h-4 items-center bg-emerald-500/10 px-1.5 text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">API</span>
                        ) : page.pageType === "concept" ? (
                          <span className="ml-2 rounded flex h-4 items-center bg-amber-500/10 px-1.5 text-[8px] font-black uppercase tracking-widest text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">Concept</span>
                        ) : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
