import { Link, useLocation } from "react-router-dom";
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
import { LayoutDashboard, Home, User, Plus, Compass } from "lucide-react";
import { Button } from "@/public_zone/ui/button";

const mainNav = [
  { to: "/dashboard/red", label: "Overview", icon: LayoutDashboard },
];

const projectNav = [
  { to: "/dashboard/red/properties", label: "My Projects", icon: Home },
];

const accountNav = [
  { to: "/dashboard/red/profile", label: "Developer Profile", icon: User },
];

export function REDSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="px-4 py-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex bg-orange-600 h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold shadow-lg shadow-orange-600/20">
                D
              </div>
              <span className="font-bold text-sm tracking-tight">anan-ai Developer</span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-4">
            <Button asChild className="w-full justify-between rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-none border-none py-5" size="sm">
              <Link to="/dashboard/red/properties/create">
                <span>New project</span>
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
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
                    <span className="text-sm">Main Website</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] font-bold tracking-wider text-muted-foreground px-3">PORTFOLIO</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectNav.map((item) => (
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
          <SidebarGroupLabel className="text-[10px] font-bold tracking-wider text-muted-foreground px-3">SETTINGS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
