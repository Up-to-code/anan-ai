import { Star, ShieldCheck, Sparkles } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";

type IconComponent = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export interface AuthConfig {
    visualSide: {
        title: { main: string; highlight: string };
        description: string;
        features: {
            icon: IconComponent;
            label: string;
            colorClass: string;
        }[];
    };
    formSide: {
        badge: string;
        title: string;
        description: string;
        googleButtonText: string;
        footer: {
            trustBadge: string;
            text: string;
            termsText: string;
            privacyText: string;
        };
    };
}

export const defaultAuthConfig: AuthConfig = {
    visualSide: {
        title: { main: "الجيل القادم من", highlight: "العقار الذكي" },
        description: "انضم إلى آلاف المستخدمين والشركات الذين يعيدون تعريف سوق العقار السعودي باستخدام الذكاء الاصطناعي.",
        features: [
            { icon: Sparkles, label: "بحث ذكي يعتمد على المحادثة", colorClass: "text-blue-400" },
            { icon: ShieldCheck, label: "بيانات وعقارات موثقة بنسبة ١٠٠٪", colorClass: "text-emerald-400" },
            { icon: Star, label: "توصيات مخصصة حسب قدرتك التمويلية", colorClass: "text-orange-400" }
        ]
    },
    formSide: {
        badge: "anan",
        title: "مرحباً بك",
        description: "سجل دخولك للبدء في اكتشاف المستقبل.",
        googleButtonText: "تسجيل الدخول باستخدام جوجل",
        footer: {
            trustBadge: "موثوق وأمن",
            text: "بالتوقيع، أنت تؤكد موافقتك على",
            termsText: "اتفاقية الخدمة",
            privacyText: "سياسة الخصوصية"
        }
    }
};
