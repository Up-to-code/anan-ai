import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Section } from "@/app/[locale]/(public)/public";
import { getBlogPost, getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { withLocale } from "@/lib/routes";
import { createPageMetadata } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as AppLocale;
  const post = getBlogPost(locale, slug);

  if (!post) {
    return createPageMetadata(locale, "/blog", "Anan Blog", "Article not found.");
  }

  return createPageMetadata(locale, `/blog/${slug}`, post.title, post.excerpt);
}

export default async function BlogPostPage({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as AppLocale;
  const post = getBlogPost(locale, slug);
  const blog = getMarketingContent(locale).blog;

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white pt-40 pb-32 dark:bg-slate-950">
      <Section className="mx-auto max-w-3xl space-y-16">
        <div className="space-y-8">
          <Link href={withLocale(locale, "/blog")} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-300">
            <ChevronRight className="h-4 w-4" />
            {blog.backToBlog}
          </Link>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <span className="bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                {post.category}
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
            </div>
            <h1 className="text-4xl font-black leading-tight text-slate-900 dark:text-slate-100 md:text-5xl">{post.title}</h1>
          </div>
        </div>

        <article className="prose prose-slate prose-lg whitespace-pre-line border-t-2 border-slate-100 pt-16 font-bold leading-relaxed text-slate-700 dark:prose-invert dark:border-slate-800 dark:text-slate-300 md:prose-xl">
          {post.content}
        </article>

        <div className="mt-16 border-t-2 border-slate-100 pt-16 text-center dark:border-slate-800">
          <h3 className="mb-6 text-xl font-black uppercase text-slate-900 dark:text-slate-100">{blog.shareArticle}</h3>
          <div className="flex justify-center gap-4">
            <button type="button" className="flex h-12 w-12 items-center justify-center bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-blue-600 hover:text-white dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-blue-500">X</button>
            <button type="button" className="flex h-12 w-12 items-center justify-center bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-blue-600 hover:text-white dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-blue-500">IN</button>
          </div>
        </div>
      </Section>
    </main>
  );
}
