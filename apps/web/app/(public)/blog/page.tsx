import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";

export const metadata: Metadata = {
  title: "المدونة والتحديثات | عنان",
  description: "مقالات، رؤى، وتحديثات حول السوق العقاري السعودي، تقنيات البروبتك، وأثر الذكاء الاصطناعي في الاستثمار.",
};

const BLOG_POSTS = [
  {
    slug: "saudi-real-estate-tech-2030",
    title: "التقنية العقارية ورؤية ٢٠٣٠: كيف تعيد عنان تشكيل البنية التحتية",
    excerpt: "نظرة متعمقة على دور البروبتك (PropTech) في تسريع وتيرة التحول الرقمي للقطاع العقاري في المملكة...",
    date: "١٢ مارس ٢٠٢٥",
    category: "رؤية واستراتيجية",
  },
  {
    slug: "ai-property-valuation",
    title: "الأسعار العادلة: أثر الذكاء الاصطناعي على التقييم العقاري",
    excerpt: "تعرف على آلية المطابقة السعرية في منصة عنان، وكيف تحمي الخوارزميات حقوق الأطراف عبر بيانات شفافة.",
    date: "٥ مارس ٢٠٢٥",
    category: "الذكاء الاصطناعي",
  },
  {
    slug: "brokers-network-future",
    title: "مستقبل الوسطاء: لماذا تعتبر الشبكات المؤسسية هي الملاذ الآمن للعمولات؟",
    excerpt: "تحليل لأهمية الارتباط بالمنصات المعتمدة من الهيئة العامة للعقار لضمان حقوق ومجهودات الوسيط.",
    date: "٢٠ فبراير ٢٠٢٥",
    category: "دليل الوسطاء",
  },
];

type BlogPostSummary = (typeof BLOG_POSTS)[number];

function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block focus:outline-none focus-visible:ring-4 ring-blue-600 ring-offset-4">
      <article className="border-2 border-slate-100 bg-white p-10 h-full flex flex-col space-y-8 transition-colors group-hover:border-blue-600">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1">
            {post.category}
          </span>
          <BookOpen className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
        </div>
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-3 leading-snug">
            {post.title}
          </h2>
          <p className="text-slate-500 font-bold leading-relaxed line-clamp-3">{post.excerpt}</p>
        </div>
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
          <span className="text-xs font-black uppercase text-slate-400">{post.date}</span>
          <span className="text-xs font-black uppercase text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            اقرأ المزيد
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function BlogIndexPage() {
  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          contentClassName="max-w-4xl mx-auto space-y-8"
          badge={
            <SectionLabel
              className="inline-flex"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-600"
            >
              الرؤى والبيانات النشرية
            </SectionLabel>
          }
          title={<>مدونة <br /><span className="text-blue-600 text-3xl">عنان للأخبار والمقالات</span></>}
          titleClassName="text-6xl font-black text-slate-900 uppercase leading-tight"
          description={
            <p className="max-w-2xl text-xl font-bold leading-relaxed text-slate-500">
              تابع أحدث تحليلات السوق السعودي والتقنيات العقارية المؤسسية من خبراء عنان.
            </p>
          }
        />
      </Section>

      <Section className="py-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {BLOG_POSTS.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </Section>
    </main>
  );
}
