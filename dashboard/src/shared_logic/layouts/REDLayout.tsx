/**
 * @deprecated Dashboard shell has been unified under DashboardLayout.
 * Keep this file only for backward reference; do not wire it into routes.
 */
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/public_zone/ui/sidebar";
import { REDSidebar } from "./REDSidebar";
import { Bell, MessageSquare, Sun, User } from "lucide-react";
import { CommandPalette } from "@/public_zone/components/CommandPalette";

export default function REDLayout() {
  return (
    <SidebarProvider>
      <REDSidebar />
      <SidebarInset className="bg-white">
        <header className="flex h-16 shrink-0 items-center justify-between px-6 md:px-12 border-b border-border/40">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold tracking-tight">Real Estate Developer Dashboard</h1>
          </div>
          <div className="flex items-center gap-6">
            <CommandPalette />
            <div className="flex items-center gap-4 text-muted-foreground mr-4 pl-4 border-l border-border/40">
              <Sun className="h-4 w-4 cursor-pointer hover:text-foreground" />
              <MessageSquare className="h-4 w-4 cursor-pointer hover:text-foreground" />
              <Bell className="h-4 w-4 cursor-pointer hover:text-foreground" />
            </div>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border/50">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col px-6 md:px-12 py-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
