import { Footer, Navbar } from "@/app/(public)/public";
import PublicConvexProvider from "@/app/(public)/PublicConvexProvider";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PublicConvexProvider>
            <div
                className="min-h-screen bg-background text-foreground selection:bg-blue-600 selection:text-white transition-colors"
                dir="rtl"
            >
                <Navbar />
                {children}
                <Footer />
            </div>
        </PublicConvexProvider>
    );
}
