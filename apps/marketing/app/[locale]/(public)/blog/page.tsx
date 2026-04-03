import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { PageHero, Section, SectionLabel } from "@/app/[locale]/(public)/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { withLocale } from "@/lib/routes";
import { createPageMetadata } from "@/lib/site";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.blog;
  return createPageMetadata(locale, "/blog", seo.title, seo.description);
}

export default async function BlogIndexPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const blog = getMarketingContent(locale).blog;

  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          contentClassName="max-w-4xl mx-auto space-y-8 text-center"
          badge={
            <SectionLabel
              className="mx-auto inline-flex"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-600"
            >
              {blog.eyebrow}
            </SectionLabel>
          }
          title={<>{blog.title}</>}
          titleClassName="text-6xl font-black leading-tight text-slate-900 dark:text-slate-100"
          description={<p className="mx-auto max-w-2xl">{blog.description}</p>}
          descriptionClassName="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
        />
      </Section>

      <Section className="py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
          {blog.posts.map((post) => (
            <Link
              key={post.slug}
              href={withLocale(locale, `/blog/${post.slug}`)}
              className="group block focus:outline-none focus-visible:ring-4 ring-blue-600 ring-offset-4"
            >
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
                  <span className="text-xs font-black uppercase text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                    {blog.readMore}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}
