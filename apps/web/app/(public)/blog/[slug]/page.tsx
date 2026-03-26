import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { Section } from "@/app/(public)/public";

type Props = {
  params: Promise<{ slug: string }>;
};

const STATIC_POSTS: Record<string, { title: string; content: string; date: string; category: string }> = {
  "workspace-entry-points": {
    title: "كيف صممنا الصفحة العامة لتكون مدخلاً واضحاً إلى مساحة العمل",
    date: "١٢ مارس ٢٠٢٥",
    category: "المنتج",
    content: "عندما يصل الزائر إلى عنان، لا نريده أن يضيع بين لغة عامة مبالغ فيها وبين تفاصيل داخلية لا تخصه بعد. لهذا صممنا الصفحة العامة لتكون نقطة تعريف واضحة: من نحن، ماذا نقدم، وكيف يصل المطور أو الوسيط إلى المساحة المناسبة له.\n\nالفكرة الأساسية بسيطة. الموقع العام يشرح، ومساحة العمل تنفذ. بهذه الطريقة تبقى الرسالة الخارجية نظيفة ومباشرة، بينما تظل التجربة الداخلية مركزة على ما يحتاجه المستخدم في يومه العملي.",
  },
  "developer-workspace-notes": {
    title: "ما الذي يحتاجه فريق التطوير فعلاً من مساحة العمل؟",
    date: "٥ مارس ٢٠٢٥",
    category: "مساحة المطورين",
    content: "فريق التطوير لا يحتاج إلى شعارات كثيرة داخل واجهة العمل. ما يحتاجه فعلاً هو وضوح في المشاريع، البيانات، الحالة الحالية، والعلاقة مع بقية الأطراف. لهذا نعيد صياغة تجربة المطورين في عنان حول الوضوح قبل أي شيء آخر.\n\nالواجهة الجيدة لا تكتفي بعرض المعلومات، بل ترتبها بحيث يستطيع الفريق أن يفهم ما يحدث بسرعة ويتحرك بثقة. هذه هي العدسة التي نستخدمها عندما نتحدث عن مساحة المطورين.",
  },
  "broker-workspace-rhythm": {
    title: "إيقاع العمل اليومي للوسيط داخل عنان",
    date: "٢٠ فبراير ٢٠٢٥",
    category: "مساحة الوسطاء",
    content: "مساحة الوسطاء في عنان لا يفترض أن تكون مكاناً مزدحماً بالمصطلحات الثقيلة. المقصود منها أن تعطي الوسيط طريقاً عملياً لفهم ما يحتاجه اليوم، وما الذي ينتظر متابعة، وكيف يتواصل مع المطور من دون أن يضيع السياق.\n\nكلما كانت الخطوات أوضح، كان العمل اليومي أكثر سلاسة. لذلك نتعامل مع تجربة الوسيط على أنها إيقاع مستمر من المتابعة المنظمة، وليس مجرد صفحة معلومات عامة.",
  },
};

type StaticPost = (typeof STATIC_POSTS)[string];

function BlogPostHeader({ post }: { post: StaticPost }) {
  return (
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
  );
}

function BlogShareActions() {
  return (
    <div className="mt-16 border-t-2 border-slate-100 pt-16 text-center dark:border-slate-800">
      <h3 className="mb-6 text-xl font-black uppercase text-slate-900 dark:text-slate-100">شارك هذا المقال</h3>
      <div className="flex justify-center gap-4">
        <button type="button" className="flex h-12 w-12 items-center justify-center bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-blue-600 hover:text-white dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-blue-500">تويتر</button>
        <button type="button" className="flex h-12 w-12 items-center justify-center bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-blue-600 hover:text-white dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-blue-500">لينكدإن</button>
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
    <main className="min-h-screen bg-white pt-40 pb-32 dark:bg-slate-950">
      <Section className="max-w-3xl mx-auto space-y-16">
        <div className="space-y-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-300">
            <ChevronRight className="h-4 w-4" />
            العودة للمدونة
          </Link>
          <BlogPostHeader post={post} />
        </div>

        <article className="prose prose-slate prose-lg whitespace-pre-line border-t-2 border-slate-100 pt-16 font-bold leading-relaxed text-slate-700 dark:prose-invert dark:border-slate-800 dark:text-slate-300 md:prose-xl">
          {post.content}
        </article>

        <BlogShareActions />
      </Section>
    </main>
  );
}
