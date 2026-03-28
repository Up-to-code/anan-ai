import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { PageHero, Section, SectionLabel } from "@/app/(public)/public";

export const metadata: Metadata = {
  title: "المدونة والتحديثات | عنان",
  description: "مقالات وتحديثات حول بناء مساحة العمل في عنان، تجربة المطورين والوسطاء، وكيف نفكر في المنتج.",
};

const BLOG_POSTS = [
  {
    slug: "workspace-entry-points",
    title: "كيف صممنا الصفحة العامة لتكون مدخلاً واضحاً إلى مساحة العمل",
    excerpt: "شرح لفكرة الفصل بين التعريف بالشركة في الصفحات العامة، والعمل الفعلي داخل المساحة المخصصة للمطورين والوسطاء...",
    date: "١٢ مارس ٢٠٢٥",
    category: "المنتج",
  },
  {
    slug: "developer-workspace-notes",
    title: "ما الذي يحتاجه فريق التطوير فعلاً من مساحة العمل؟",
    excerpt: "ملاحظاتنا حول كيف يجب أن تبدو واجهة المطورين عندما يكون الهدف هو الوضوح والمتابعة بدل الضجيج التسويقي.",
    date: "٥ مارس ٢٠٢٥",
    category: "مساحة المطورين",
  },
  {
    slug: "broker-workspace-rhythm",
    title: "إيقاع العمل اليومي للوسيط داخل عنان",
    excerpt: "كيف تساعد مساحة الوسطاء على ترتيب التفاصيل، متابعة الحالات، وتقديم سياق أوضح للتواصل مع المطورين.",
    date: "٢٠ فبراير ٢٠٢٥",
    category: "مساحة الوسطاء",
  },
];

type BlogPostSummary = (typeof BLOG_POSTS)[number];

function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block focus:outline-none focus-visible:ring-4 ring-blue-600 ring-offset-4">
      <article className="flex h-full flex-col space-y-8 border-2 border-slate-100 bg-white p-10 transition-colors group-hover:border-blue-600 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <span className="bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            {post.category}
          </span>
          <BookOpen className="h-5 w-5 text-slate-300 transition-colors group-hover:text-blue-600 dark:text-slate-600 dark:group-hover:text-blue-300" />
        </div>
        <div className="flex-1 space-y-4">
          <h2 className="line-clamp-3 text-2xl font-black leading-snug text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-300">
            {post.title}
          </h2>
          <p className="line-clamp-3 font-bold leading-relaxed text-slate-500 dark:text-slate-300">{post.excerpt}</p>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
          <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">{post.date}</span>
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
          title={<>مدونة <br /><span className="text-blue-600 text-3xl">عنان للمقالات والتحديثات</span></>}
          titleClassName="text-6xl font-black uppercase leading-tight text-slate-900 dark:text-slate-100"
          description={
            <p className="max-w-2xl text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
              نكتب هنا عن المنتج، تجربة المساحة، وكيف نفكر في العمل اليومي للمطورين والوسطاء.
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
