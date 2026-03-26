import type { LucideIcon } from "lucide-react";
import { User, Code2, Briefcase } from "lucide-react";
import { ButtonLink, PageHero, Section, SectionLabel } from "@/app/(public)/public";

const teamRoles = [
  {
    icon: User,
    title: "قيادة المنتج",
    subtitle: "اتجاه المنصة",
    description: "تحديد كيف يجب أن تبدو الصفحة العامة ومساحة العمل حتى تكون القيمة واضحة من أول زيارة.",
  },
  {
    icon: Code2,
    title: "أحمد منصور",
    subtitle: "القيادة التقنية",
    description: "بناء التجربة التقنية التي تجمع بين الوضوح في الواجهة والاعتماد على نظام منتج قابل للتوسع.",
  },
] as const;

function TeamHeroSection() {
  return (
    <Section bg="slate" className="pt-40">
      <PageHero
        contentClassName="max-w-4xl mx-auto space-y-12 text-right"
        badge={
          <SectionLabel
            icon={Briefcase}
            className="inline-flex items-center gap-3 bg-blue-600/10 px-4 py-2 border-r-4 border-blue-600"
            iconClassName="h-5 w-5 text-blue-600"
            textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
          >
            فريق عنان
          </SectionLabel>
        }
        title={
          <>
            الخبرة خلف <br />
            <span className="text-blue-600">مساحة العمل</span>
          </>
        }
        titleClassName="text-6xl font-black uppercase text-slate-900 dark:text-slate-100"
        description={<p>نبني في عنان شركة ومنتجاً يركزان على الوضوح، التنظيم، وتجربة عمل أفضل للمطورين والوسطاء.</p>}
        descriptionClassName="max-w-2xl text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
      />
    </Section>
  );
}

function TeamRoleCard(props: { icon: LucideIcon; title: string; subtitle: string; description: string }) {
  const Icon = props.icon;
  return (
    <div className="group space-y-8 border-2 border-slate-100 bg-white p-12 transition-all hover:border-blue-600 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-20 w-20 items-center justify-center bg-slate-50 transition-colors group-hover:bg-blue-600 dark:bg-slate-900">
        <Icon className="h-10 w-10 text-slate-300 group-hover:text-white dark:text-slate-500" />
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-slate-100">{props.title}</h3>
        <span className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{props.subtitle}</span>
        <p className="font-bold leading-relaxed text-slate-500 dark:text-slate-300">{props.description}</p>
      </div>
    </div>
  );
}

function TeamJoinSection() {
  return (
    <Section className="border-t border-slate-100 py-24 text-center dark:border-slate-800">
      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-4xl font-black uppercase text-slate-900 dark:text-slate-100">انضم إلى القادة</h2>
        <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
          نبني منتجاً ومساحة عمل أوضح، ونبحث دائماً عن أشخاص يحبون تحويل التعقيد إلى تجربة مفهومة وقابلة للاستخدام.
        </p>
        <div className="pt-6">
          <ButtonLink href="/contact" variant="primary" className="px-10 py-5">
            تحدث معنا
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}

/**
 * WHY:   Trust-building pages should communicate who builds and operates the platform.
 * WHAT:  Renders the Team page with role cards and operating principles.
 * HOW:   Fully server-rendered for speed and SEO.
 */
export default function TeamPage() {
  return (
    <main>
      <TeamHeroSection />
      <Section className="py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto">
          {teamRoles.map((role) => (
            <TeamRoleCard key={role.title} {...role} />
          ))}
        </div>
      </Section>
      <TeamJoinSection />
    </main>
  );
}
