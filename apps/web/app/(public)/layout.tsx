import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import PublicConvexProvider from "@/app/(public)/PublicConvexProvider";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PublicConvexProvider>
            <div className="min-h-screen selection:bg-blue-600 selection:text-white" dir="rtl">
                <Navbar />
                {children}
                <Footer />
            </div>
        </PublicConvexProvider>
    );
}
