import { Link, useLocation } from "react-router-dom";
import { cn } from "@/_core/lib/utils";
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
} from "@/public_zone/ui/sidebar";
import {
  Home,
  FileText,
  Users,
  TrendingUp,
  BarChart,
  Star,
  Plus,
  Compass,
  Building2,
  BookOpen,
  GitBranch,
  Bell,
  Activity,
  Bot,
} from "lucide-react";
import { Button } from "@/public_zone/ui/button";

const mainNav = [
  { to: "/admin", label: "Home", icon: Home },
  { to: "/admin/agents", label: "Agents", icon: Bot },
];

const contentNav = [
  { to: "/admin/properties", label: "Properties", icon: FileText },
  { to: "/admin/knowledge", label: "Knowledge", icon: BookOpen },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
];

const audienceNav = [
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/customers", label: "Customers", icon: TrendingUp },
  { to: "/admin/partners", label: "Partners", icon: Building2 },
];

const toolNav = [
  { to: "/admin/pipeline", label: "Pipeline", icon: GitBranch },
  { to: "/admin/activities", label: "Activities", icon: Activity },
  { to: "/admin/charts", label: "Stats", icon: BarChart },
  { to: "/admin/developers", label: "Developers", icon: Star },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/10 bg-white/40 backdrop-blur-3xl selection:bg-primary/10">
      <SidebarHeader className="px-6 py-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 mb-8 group cursor-pointer">
              <div className="flex bg-slate-900 h-9 w-9 items-center justify-center rounded-xl text-white group-hover:scale-105 transition-transform duration-500">
                <span className="text-lg font-bold">A</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none">anan-ai</span>
                <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase mt-1">Intelligence</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button className="w-full justify-between rounded-xl bg-white border border-border/40 hover:bg-slate-50 text-slate-900 font-bold py-6 transition-all group" size="sm">
              <span>Create new</span>
              <Plus className="h-4 w-4 text-primary group-hover:rotate-90 transition-transform" />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-4 pb-12">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                    className="hover:bg-muted/50 rounded-md transition-all px-3"
                  >
                    <Link to={item.to} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-muted/50 rounded-md transition-all px-3">
                  <Link to="/" className="flex items-center gap-3">
                    <Compass className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Website</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] font-bold tracking-wider text-muted-foreground px-3">CONTENT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentNav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                    className="hover:bg-muted/50 rounded-md transition-all px-3"
                  >
                    <Link to={item.to} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] font-bold tracking-wider text-muted-foreground px-3">AUDIENCE</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {audienceNav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                    className="hover:bg-muted/50 rounded-md transition-all px-3"
                  >
                    <Link to={item.to} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] font-bold tracking-wider text-muted-foreground px-3">CREATOR TOOLS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolNav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                    className={cn(
                      "rounded-xl transition-all duration-300 py-5 px-4 mb-1 group",
                      location.pathname === item.to
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                        : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Link to={item.to} className="flex items-center gap-4">
                      <item.icon className={cn(
                        "h-4 w-4 transition-colors",
                        location.pathname === item.to ? "text-blue-500" : "text-slate-400 group-hover:text-slate-600"
                      )} />
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {/* Clean-Simple Secondary Nav Item */}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
