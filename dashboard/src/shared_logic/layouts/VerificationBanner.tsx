import { AlertCircle } from "lucide-react";
import { useUserData } from "@/_core/hooks/useUserData";
import { Link } from "react-router-dom";
import { useLocale } from "@/shared_logic/i18n/useLocale";

export function VerificationBanner() {
    const { isVerified, role, isLoading } = useUserData();
    const { localizePath } = useLocale();

    if (isLoading || isVerified || role === "user" || !role) {
        return null;
    }

    return (
        <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-50/70 px-4 py-3 md:px-6">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-amber-900">
                    حسابك غير موثق حالياً. بعض الميزات مثل نشر العروض ستكون مقيدة حتى يتم مراجعة بياناتك.
                </p>
                <Link
                    to={localizePath("/dashboard/verification")}
                    className="self-start whitespace-nowrap rounded-sm border border-amber-200 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-200 sm:self-auto"
                >
                    أكمل التوثيق
                </Link>
            </div>
        </div>
    );
}
