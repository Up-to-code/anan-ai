import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { Section } from "@/app/(public)/public";

type Props = {
  params: Promise<{ slug: string }>;
};

const STATIC_POSTS: Record<string, { title: string; content: string; date: string; category: string }> = {
  "saudi-real-estate-tech-2030": {
    title: "التقنية العقارية ورؤية ٢٠٣٠: كيف تعيد عنان تشكيل البنية التحتية",
    date: "١٢ مارس ٢٠٢٥",
    category: "رؤية واستراتيجية",
    content: "يعد التحول الرقمي في القطاع العقاري أحد الركائز الأساسية لتحقيق مستهدفات رؤية المملكة ٢٠٣٠. تساهم التقنيات العقارية (PropTech) في رفع جودة الحياة وتحسين كفاءة الخدمات عبر منصات مؤسسية متينة. تقوم \"عنان\" بدور محوري في هذا المجال من خلال تقديم بنية تحتية تعتمد على المطابقة الذكية والعقود الفورية، مما يوفر الوقت ويرفع من مستوى الشفافية. \n\nمن خلال تقديم تحليلات فورية ودقيقة للسوق، نساعد المطورين على تخطيط مشاريعهم بما يتوافق مع الاحتياج الفعلي، ونوفر للوسطاء بيئة آمنة تضمن حقوقهم، ونسهل على المستثمرين اتخاذ قرارات مبنية على بيانات موثوقة.",
  },
  "ai-property-valuation": {
    title: "الأسعار العادلة: أثر الذكاء الاصطناعي على التقييم العقاري",
    date: "٥ مارس ٢٠٢٥",
    category: "الذكاء الاصطناعي",
    content: "الأسعار العادلة لم تعد مجرد تخمينات بشرية؛ لقد أصبح الذكاء الاصطناعي قادراً على تحليل آلاف الصفقات السابقة، والعوامل الجغرافية، والاتجاهات الاقتصادية لتوفير تقييمات عقارية لحظية ودقيقة. في عنان، نستفيد من خوارزميات التعلم الآلي المتقدمة لمقارنة الوحدات العقارية المطروحة مع أسعار السوق المعياري. يضمن هذا النهج عدم وجود تضخم غير مبرر، ويعطي صورة واضحة وموثوقة تسهم في استقرار السوق وجذب الاستثمارات.",
  },
  "brokers-network-future": {
    title: "مستقبل الوسطاء: لماذا تعتبر الشبكات المؤسسية هي الملاذ الآمن للعمولات؟",
    date: "٢٠ فبراير ٢٠٢٥",
    category: "دليل الوسطاء",
    content: "مع تنامي التنظيمات التشريعية من الهيئة العامة للعقار، أصبح دور الوسيط الفردي محاطاً بتحديات كبيرة فيما يتعلق بضمان العمولات وإتمام الصفقات الكبرى. توفر الشبكات المؤسسية مثل عنان حلاً جذرياً لهذه التحديات من خلال الربط التقني المباشر لحفظ الحقوق فورياً. الانضمام إلى منظومة ربط موحدة لا يضمن فقط العمولة، بل يوفر للوسيط العقاري وصولاً أسرع لآلاف الوحدات العقارية الحصرية من كبار المطورين المعتمدين.",
  },
};

type StaticPost = (typeof STATIC_POSTS)[string];

function BlogPostHeader({ post }: { post: StaticPost }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1">
          {post.category}
        </span>
        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {post.date}
        </span>
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">{post.title}</h1>
    </div>
  );
}

function BlogShareActions() {
  return (
    <div className="border-t-2 border-slate-100 pt-16 mt-16 text-center">
      <h3 className="text-xl font-black text-slate-900 mb-6 uppercase">شارك هذا المقال</h3>
      <div className="flex justify-center gap-4">
        <button type="button" className="h-12 w-12 bg-slate-50 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-slate-400 font-black text-xs uppercase tracking-widest">تويتر</button>
        <button type="button" className="h-12 w-12 bg-slate-50 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-slate-400 font-black text-xs uppercase tracking-widest">لينكدإن</button>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = STATIC_POSTS[resolvedParams.slug];
  
  if (!post) {
    return { title: "المقال غير موجود | عنان" };
  }

  return {
    title: `${post.title} | عنان`,
    description: post.content.substring(0, 150) + "...",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = STATIC_POSTS[resolvedParams.slug];

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-white min-h-screen pt-40 pb-32">
      <Section className="max-w-3xl mx-auto space-y-16">
        <div className="space-y-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            <ChevronRight className="h-4 w-4" />
            العودة للمدونة
          </Link>
          <BlogPostHeader post={post} />
        </div>

        <article className="prose prose-slate prose-lg md:prose-xl text-slate-700 font-bold leading-relaxed whitespace-pre-line border-t-2 border-slate-100 pt-16">
          {post.content}
        </article>

        <BlogShareActions />
      </Section>
    </main>
  );
}
