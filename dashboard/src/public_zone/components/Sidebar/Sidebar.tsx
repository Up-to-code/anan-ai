import { Link, useLocation } from "react-router-dom";
import { cn } from "@/_core/lib/utils";
import {
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    Briefcase,
    Inbox,
    LogOut
} from "lucide-react";
import { useAppStore } from "@/_core/store/useAppStore";

export function Sidebar() {
    const location = useLocation();
    const { isSidebarOpen } = useAppStore();
    const pathname = location.pathname;

    const links = [
        { href: "/broker/overview", label: "Overview", icon: LayoutDashboard },
        { href: "/broker/properties", label: "Properties", icon: Building2 },
        { href: "/broker/crm", label: "CRM", icon: Users },
        { href: "/broker/offers", label: "Offers", icon: Briefcase },
        { href: "/broker/inbox", label: "Inbox", icon: Inbox },
        { href: "/broker/profile", label: "Profile", icon: Settings },
    ];

    return (
        <aside
            className={cn(
                "fixed right-0 top-0 z-40 h-screen transition-transform rtl",
                isSidebarOpen ? "translate-x-0 w-64" : "translate-x-full w-20 md:translate-x-0",
                "bg-white border-l border-border"
            )}
        >
            <div className="flex h-16 items-center justify-center border-b">
                <span className="text-xl font-bold">anan-ai</span>
            </div>
            <div className="py-4">
                <ul className="space-y-2 font-medium px-3">
                    {links.map((link) => {
                        const isActive = pathname.startsWith(link.href) || pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    to={link.href}
                                    className={cn(
                                        "flex items-center p-2 rounded-lg hover:bg-muted group transition-colors",
                                        isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
                                    )}
                                >
                                    <link.icon className={cn("w-5 h-5", isSidebarOpen && "mr-3")} />
                                    {isSidebarOpen && <span>{link.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="absolute bottom-0 w-full p-4 border-t">
                <button className="flex items-center p-2 w-full text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <LogOut className="w-5 h-5 mr-3" />
                    {isSidebarOpen && <span>تسجيل خروج</span>}
                </button>
            </div>
        </aside>
    );
}
