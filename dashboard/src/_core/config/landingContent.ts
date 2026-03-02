import { Sparkles, Activity, Building2, ArrowUpRight } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type IconComponent = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export interface LandingConfig {
    theme: "blue" | "emerald" | "orange";
    role: "customer" | "broker" | "developer" | "contact";
    hero: {
        badge: { icon: IconComponent; text: string };
        title: { main: string; highlight: string };
        description: string;
        chatPlaceholder: string;
    };
    features: {
        badge: { icon: IconComponent; text: string };
        title: string;
        description: string;
    };
    analysis?: {
        image: string;
        badge: string;
        title: string;
        description: string;
        points: { icon: IconComponent; text: string }[];
    };
    testimonials?: {
        title: { main: string; highlight: string };
        items: { name: string; role: string; text: string }[];
    };
    faqs: { q: string; a: string }[];
    cta: {
        title: { main: string; highlight: string };
        description: string;
        buttonText: string;
        link: string;
    };
}

export const customersConfig: LandingConfig = {
    theme: "blue",
    role: "customer",
    hero: {
        badge: { icon: Sparkles, text: "The Future of Riyadh Living" },
        title: { main: "ابحث عن", highlight: "منزلك بذكاء" },
        description: "دردش مع مساعدك الشخصي، حدد ميزانيتك، ودع الذكاء الاصطناعي يجد لك المنزل المثالي في قلب الرياض.",
        chatPlaceholder: "أبحث عن فيلا مودرن في شمال الرياض...",
    },
    features: {
        badge: { icon: Sparkles, text: "AI Exploration" },
        title: "تكنولوجيا تفهم ما تبحث عنه",
        description: "تجاوزنا طرق البحث التقليدية لنقدم لك تجربة تفاعلية مبنية على أحدث تقنيات التعليم العميق.",
    },
    analysis: {
        image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop",
        badge: "حي النخيل",
        title: "استكشف منظوراً جديداً للسكن",
        description: "خرائطنا ليست مجرد صور، بل أنظمة معلومات جغرافية تدمج بين الرفاهية، الخدمات، واتجاهات الأسعار.",
        points: [
            { icon: Sparkles, text: "تحليل جودة الحياة وكثافة الخدمات" },
            { icon: Sparkles, text: "توقع نمو أسعار العقارات" },
            { icon: Sparkles, text: "محاكاة مسافات التنقل اليومية" },
        ]
    },
    testimonials: {
        title: { main: "قالوا عن", highlight: "عنان" },
        items: [
            { name: "محمد العويف", role: "باحث عن منزل", text: "أفضل تجربة بحث عقاري مررت بها. المساعد الذكي وفر علي أسابيع من التعب في البحث التقليدي." },
            { name: "نورة القحطاني", role: "مستثمرة", text: "دقة البيانات والتحليلات في عنان لا تقدر بثمن. ساعدتني في اتخاذ قرار شراء ناجح جداً." },
            { name: "ياسر العتيبي", role: "باحث عن منزل", text: "الخريطة التفاعلية والدردشة غيرت مفهومي عن التطبيقات العقارية. فعلاً هذا هو المستقبل." }
        ]
    },
    faqs: [
        { q: "كيف يبدأ الذكاء الاصطناعي بالبحث عن عقاري؟", a: "بمجرد كتابة ما تبحث عنه في الدردشة، يقوم نظامنا بتحليل آلاف العقارات ومطابقتها مع تفضيلاتك الشخصية فوراً." },
        { q: "هل الخدمة مجانية للباحثين عن سكن؟", a: "نعم، البحث واستخدام المساعد الذكي مجاني تماماً للباحثين عن منازل." },
        { q: "كيف أضمن دقة موقع العقار؟", a: "جميع العقارات موثقة ومربوطة بنظام خرائط دقيق لضمان الوصول للموقع الصحيح بنقرة واحدة." },
    ],
    cta: {
        title: { main: "ابدأ رحلتك", highlight: "نحو التميز" },
        description: "انضم إلى آلاف الباحثين عن التميز العقاري في أرقى أحياء الرياض.",
        buttonText: "ابدأ البحث الآن",
        link: "/signin"
    }
};

export const brokersConfig: LandingConfig = {
    theme: "emerald",
    role: "broker",
    hero: {
        badge: { icon: Activity, text: "Saudi Real Estate" },
        title: { main: "حول بياناتك إلى", highlight: "صفقات ناجحة" },
        description: "أقوى أدوات الذكاء الاصطناعي لزيادة كفاءة التسويق وسرعة الإغلاق.",
        chatPlaceholder: "حلل قائمة العقارات في شمال الرياض...",
    },
    features: {
        badge: { icon: Activity, text: "AI Brokerage" },
        title: "مستقبل الوساطة الرقمية",
        description: "صممت عنان لتعيد تعريف دور الوسيط في السوق السعودي.",
    },
    faqs: [
        { q: "كيف أحصل على عملاء مؤهلين؟", a: "يقوم نظامنا بمطابقة عقاراتك آلياً مع الباحثين الذين تتناسب ميزانيتهم واحتياجاتهم مع مواصفات العقار." },
        { q: "هل هناك عمولة على الصفقات؟", a: "عنان هو منصة تسويق تقني، نحن لا نأخذ عمولة على الصفقات. اشتراكك الشهري يغطي جميع الأدوات." },
        { q: "هل يمكنني ربط نظامي الحالي؟", a: "نعم، للمشتركين في باقة المؤسسات، نوفر واجهات برمجة تطبيقات (API) للربط." },
    ],
    cta: {
        title: { main: "كن شريكاً", highlight: "في النجاح" },
        description: "أكثر من ٥,٠٠٠ وسيط محترف يستخدمون عنان يومياً.",
        buttonText: "انضم الآن",
        link: "/signin?type=broker"
    }
};

export const developersConfig: LandingConfig = {
    theme: "orange",
    role: "developer",
    hero: {
        badge: { icon: Building2, text: "Real Estate Intelligence" },
        title: { main: "بناء مستقبل", highlight: "الرياض" },
        description: "محرك ذكاء اصطناعي لدعم المطورين العقاريين في اتخاذ قرارات الاستثمار وتوجيه المشاريع الكبرى.",
        chatPlaceholder: "حلل جدوى بناء برج سكني في حي النخيل...",
    },
    features: {
        badge: { icon: Building2, text: "Investment Tools" },
        title: "أدوات الاستثمار الذكي",
        description: "نقدم رؤية استراتيجية لمستقبل التطوير العمراني في المملكة.",
    },
    analysis: {
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
        badge: "عائد استثمار +١٢.٤٪",
        title: "تحليل الجدوى المتقدم",
        description: "تحليل دقيق لبيانات الصفقات العقارية وخطط البنية التحتية لضمان نجاح مشاريعكم.",
        points: [
            { icon: ArrowUpRight, text: "تتبع لحظي للبورصة العقارية" },
            { icon: ArrowUpRight, text: "محاكاة التدفقات النقدية" },
            { icon: ArrowUpRight, text: "أدوات ربط مؤسسية (API)" },
        ]
    },
    faqs: [
        { q: "كيف تساعد عنان في الجدوى الاقتصادية للمشاريع؟", a: "يوفر نظامنا تحليلات دقيقة لأسعار الأراضي، واتجاهات السوق المستقبلية، وعوائد الاستثمار المتوقعة في كل حي بناءً على بيانات ضخمة." },
        { q: "هل يمكنني عرض مشاريعي قيد الإنشاء؟", a: "نعم، منصة عنان تتيح للمطورين عرض المشاريع في كافة مراحلها، من البيع على الخارطة وحتى التسليم النهائي." },
        { q: "كيف يتم الربط مع أنظمة التسويق الخاصة بنا؟", a: "نوفر واجهات ربط احترافية (Enterprise APIs) ضمان تزامن البيانات بين مخزونكم العقاري ومنصة عنان لحظياً." },
    ],
    cta: {
        title: { main: "ابنِ رؤيتك", highlight: "مع عنان" },
        description: "انضم لنخبة المطورين الذين يشكلون مستقبل العقار في المملكة.",
        buttonText: "ابدأ الآن",
        link: "/signin?type=developer"
    }
};

export const contactConfig: LandingConfig = {
    theme: "blue",
    role: "contact",
    hero: {
        badge: { icon: Sparkles, text: "دعم على مدار الساعة" },
        title: { main: "كيف يمكننا", highlight: "مساعدتك؟" },
        description: "تحدث مع المساعد الذكي الخاص بنا للحصول على إجابات سريعة، أو لجدولة موعد مع أحد خبرائنا العقاريين.",
        chatPlaceholder: "أحتاج مساعدة في إعداد باقة الوسيط العقاري...",
    },
    features: {
        badge: { icon: Sparkles, text: "Customer Success" },
        title: "مستوى جديد من العناية بالعملاء",
        description: "فريقنا التقني والخبراء العقاريون متواجدون دائمًا لضمان نجاحك على المنصة وتحقيق أقصى استفادة.",
    },
    faqs: [
        { q: "كيف يمكنني التواصل مع خدمة العملاء؟", a: "يمكنك التحدث مع المساعد الذكي في أي وقت، وإذا احتجت لمساعدة إضافية، سيقوم النظام بتحويلك تلقائياً إلى خبير بشري." },
        { q: "أين يقع المقر الرئيسي لشركة عنان؟", a: "يقع مقرنا الرئيسي في مدينة الرياض، المملكة العربية السعودية. ونسعد دائماً باستقبال شركائنا وعملائنا." },
        { q: "هل هناك دعم فني مخصص للشركات؟", a: "نعم، نقدم لعملائنا من الوسطاء والمطورين مدراء حسابات مخصصين لضمان سير العمل بسلاسة والتدريب على النظام." },
    ],
    cta: {
        title: { main: "هل أنت مستعد", highlight: "للبدء؟" },
        description: "انضم إلى آلاف المستخدمين الذين يثقون في عنان كمنصتهم العقارية الأولى.",
        buttonText: "ابدأ رحلتك",
        link: "/signin"
    }
};
