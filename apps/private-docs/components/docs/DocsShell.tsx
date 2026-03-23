import DocsSidebar from "./DocsSidebar";
import DocsTopNav from "./DocsTopNav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DocsSidebar />
      <SidebarInset className="min-h-svh bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <DocsTopNav />
        <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6 lg:py-12">
          <main>{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
