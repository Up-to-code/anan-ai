"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNavGroups, docsPages } from "@/lib/docs/registry";
import { resolveLocale } from "@/lib/locale";
import { withLocale } from "@/lib/routes";
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
} from "../vendor/ui/sidebar";

export default function DocsSidebar() {
  const pathname = usePathname();
  const locale = resolveLocale(pathname.split("/")[1]);

  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
      <SidebarHeader className="p-6 pb-2">
        <Link href={withLocale(locale)} className="text-base font-bold text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400">
          Anan API Docs
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        {docsNavGroups.map((group) => (
          <SidebarGroup key={group.id} className="mb-6 px-0">
            <SidebarGroupLabel className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((pageKey) => {
                  const page = docsPages[pageKey];
                  const localizedHref = withLocale(locale, page.href);
                  const isActive = pathname === localizedHref;
                  return (
                    <SidebarMenuItem key={page.key}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={page.title}
                        render={<Link href={localizedHref} />}
                        className={`h-auto rounded-md px-3 py-2 transition-colors ${
                          isActive 
                            ? "bg-slate-100 text-slate-900 font-medium dark:bg-slate-800 dark:text-slate-100" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                        }`}
                      >
                        <span className="text-sm">{page.title}</span>
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
