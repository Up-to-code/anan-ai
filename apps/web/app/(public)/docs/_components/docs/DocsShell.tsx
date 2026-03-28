import DocsSidebar from "./DocsSidebar";
import DocsTopNav from "./DocsTopNav";
import { SidebarInset, SidebarProvider } from "../vendor/ui/sidebar";

export default function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DocsSidebar />
      <SidebarInset className="min-h-svh bg-background transition-colors">
        <DocsTopNav />
        <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-6 lg:py-12">
          <main>{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
