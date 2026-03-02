import { Link } from "react-router-dom";
import { Button } from "@/public_zone/ui/button";
import { LandingLayout } from "@/public_zone/landing/LandingLayout";
import { BentoFeatureGrid, FAQSection, AIChatInput, PartnerMarquee } from "@/public_zone/landing/LandingBlocks";
import { Star } from "lucide-react";
import { customersConfig } from "@/_core/config/landingContent";
import { useLocale } from "@/shared_logic/i18n/useLocale";
import { t } from "@/shared_logic/i18n/dictionary";
/**
 * WHY:   Serves as the main gateway for end-users/customers seeking real estate services.
 * WHAT:  Displays value props, AI chat matching capabilities, and customer testimonials.
 * HOW:   Acts as an Orchestrator, dynamically localizing content via `useLocale` and `customersConfig`.
 */
export default function CustomersLanding() {
  const { locale, localizePath } = useLocale();
  const config = customersConfig;
  const HeroBadgeIcon = config.hero.badge.icon;
  const FeatureBadgeIcon = config.features.badge.icon;
  const heroTitle = t(locale, "landing.title", `${config.hero.title.main} ${config.hero.title.highlight}`);
  const heroSubtitle = t(locale, "landing.subtitle", config.hero.description);

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className={`w-full min-h-[90vh] flex flex-col items-center justify-center px-4 md:px-8 py-20 relative overflow-hidden text-center bg-white`}>
        <div className={`absolute inset-0 bg-gradient-to-b from-${config.theme}-50/50 via-white to-white`} />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <div className={`inline-flex items-center gap-2 bg-${config.theme}-500/10 border border-${config.theme}-500/20 px-4 py-2 rounded-full`}>
            <HeroBadgeIcon className={`h-4 w-4 text-${config.theme}-600`} />
            <span className={`text-xs font-semibold text-${config.theme}-600 uppercase tracking-wider`}>
              {config.hero.badge.text}
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-7xl font-bold text-slate-900 leading-tight">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              {heroSubtitle}
            </p>
          </div>

          <div className="w-full max-w-2xl mx-auto">
            <AIChatInput
              theme={config.theme}
              placeholder={config.hero.chatPlaceholder}
            />
          </div>
        </div>
      </section>

      {/* Partner Marquee */}
      <PartnerMarquee />

      {/* Features Section */}
      <section className="w-full bg-slate-50 py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto mb-16 text-center">
          <div className={`inline-flex items-center gap-2 text-${config.theme}-600 bg-${config.theme}-50 px-4 py-2 rounded-full mb-6`}>
            <FeatureBadgeIcon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">{config.features.badge.text}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            {config.features.title}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            {config.features.description}
          </p>
        </div>
        <div className="max-w-6xl mx-auto">
          <BentoFeatureGrid theme={config.theme} />
        </div>
      </section>

      {/* Interactive Map Visual */}
      {config.analysis && (
        <section className="w-full bg-white py-20 px-4 md:px-8 border-t border-slate-100">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden order-2 lg:order-1">
              <img
                src={config.analysis.image}
                className="w-full h-auto opacity-90"
                alt="Visualized Data"
              />
              <div className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur rounded-xl border border-slate-200">
                <p className={`text-xs text-${config.theme}-600 font-semibold mb-1`}>{config.analysis.badge}</p>
                <div className={`h-1 w-12 bg-${config.theme}-600 rounded-full`} />
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className={`h-14 w-14 bg-${config.theme}-600 rounded-xl flex items-center justify-center text-white`}>
                <FeatureBadgeIcon className="h-7 w-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                {config.analysis.title}
              </h2>
              <p className="text-slate-500">
                {config.analysis.description}
              </p>
              <div className="space-y-3">
                {config.analysis.points.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 text-${config.theme}-600 flex-shrink-0`} />
                    <span className="text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Premium Testimonials */}
      {config.testimonials && (
        <section className="w-full bg-slate-50/50 py-40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end justify-between gap-12 mb-24">
              <div className="text-right flex items-center gap-2 text-primary">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 fill-current" />)}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-primary uppercase tracking-[0.4em] mb-4 italic">Customer Voice</p>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                  {config.testimonials.title.main} <span className="text-primary">{config.testimonials.title.highlight}</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {config.testimonials.items.map((t, i) => (
                <div key={i} className="group p-12 rounded-[3.5rem] bg-white border border-border/40 hover:border-primary/30 transition-all duration-700 hover:-translate-y-2">
                  <p className="text-xl font-bold text-slate-700 italic leading-relaxed mb-12 text-right opacity-80 group-hover:opacity-100 transition-opacity">"{t.text}"</p>
                  <div className="flex items-center justify-end gap-5 text-right">
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{t.name}</p>
                      <p className="text-xs text-primary font-bold uppercase tracking-widest italic">{t.role}</p>
                    </div>
                    <div className="h-14 w-14 rounded-[1.5rem] bg-slate-100 border border-border/10 overflow-hidden group-hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="w-full bg-slate-50 py-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            الأسئلة الشائعة
          </h2>
        </div>
        <FAQSection questions={config.faqs} />
      </section>

      {/* CTA Section */}
      <section className={`w-full bg-${config.theme}-600 py-20 px-4 text-center text-white`}>
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            {config.cta.title.main} <span className={`text-${config.theme}-200`}>{config.cta.title.highlight}</span>
          </h2>
          <p className={`text-${config.theme}-100`}>
            {config.cta.description}
          </p>
          <Button
            asChild
            size="lg"
            className={`rounded-xl px-8 py-6 text-lg bg-white text-${config.theme}-600 hover:bg-white/90 font-semibold`}
          >
            <Link to={localizePath(config.cta.link)}>{config.cta.buttonText}</Link>
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
}
