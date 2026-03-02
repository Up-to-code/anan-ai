import { Bell, Menu, Search } from "lucide-react";
import { useAppStore } from "@/_core/store/useAppStore";
import { Button } from "@/public_zone/ui/button";

export function Header() {
    const { toggleSidebar } = useAppStore();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="بحث..."
                        className="w-64 rounded-md bg-muted pl-8 pr-4 py-2 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border-2 border-white"></span>
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    A
                </div>
            </div>
        </header>
    );
}
