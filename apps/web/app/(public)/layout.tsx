import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen selection:bg-blue-600 selection:text-white" dir="rtl">
            <Navbar />
            {children}
            <Footer />
        </div>
    );
}
