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
import { LayoutDashboard, Compass, Star, Settings } from "lucide-react";

const mainNav = [
    { to: "/user", label: "Dashboard", icon: LayoutDashboard },
    { to: "/user/favorites", label: "Saved Properties", icon: Star },
];

const accountNav = [
    { to: "/user/settings", label: "Account Settings", icon: Settings },
];

export function UserSidebar() {
    const location = useLocation();

    return (
        <Sidebar className="border-r border-border/50">
            <SidebarHeader className="px-4 py-6">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-2 py-2">
                            <div className="flex bg-slate-900 h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold shadow-lg shadow-slate-900/20">
                                U
                            </div>
                            <span className="font-bold text-sm tracking-tight">anan-ai User</span>
                        </div>
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
                                        <span className="text-sm">Explore Properties</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="text-[10px] font-bold tracking-wider text-muted-foreground px-3">ACCOUNT</SidebarGroupLabel>
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
