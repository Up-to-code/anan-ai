import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { VerificationBanner } from "./VerificationBanner";
import { QueryErrorBoundary } from "./QueryErrorBoundary";

export function DashboardLayout() {
    return (
        <div className="min-h-screen bg-slate-100/60 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:pr-64">
                <Header />
                <VerificationBanner />

                <main className="flex-1 p-4 md:p-8 max-w-[1280px] mx-auto w-full">
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <QueryErrorBoundary>
                            <Outlet />
                        </QueryErrorBoundary>
                    </div>
                </main>
            </div>
        </div>
    );
}
