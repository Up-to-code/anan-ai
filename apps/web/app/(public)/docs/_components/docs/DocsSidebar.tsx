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
} from "../vendor/ui/sidebar";

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="border-r border-slate-100 bg-white">
      <SidebarHeader className="p-6 pb-2">
        <Link href="/" className="text-base font-bold text-slate-900 transition-colors hover:text-blue-600">
          Anan API Docs
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        {docsNavGroups.map((group) => (
          <SidebarGroup key={group.id} className="mb-6 px-0">
            <SidebarGroupLabel className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-900">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((pageKey) => {
                  const page = docsPages[pageKey];
                  const isActive = pathname === page.href;
                  return (
                    <SidebarMenuItem key={page.key}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={page.title}
                        render={<Link href={page.href} />}
                        className={`h-auto rounded-md px-3 py-2 transition-colors ${
                          isActive 
                            ? "bg-slate-100 text-slate-900 font-medium" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
