import { Link } from "react-router-dom";
import { Button } from "@/public_zone/ui/button";
import { LandingLayout } from "@/public_zone/landing/LandingLayout";
import {
  AIChatInput,
  BentoFeatureGrid,
  PricingSection,
  FAQSection,
  PartnerMarquee,
} from "@/public_zone/landing/LandingBlocks";
import { developersConfig } from "@/_core/config/landingContent";
/**
 * WHY:   Targets real estate developers to onboard them into the RED zone for managing large portfolios.
 * WHAT:  Highlights analytics, broker network access, and B2B pricing plans.
 * HOW:   Designed as an Orchestrator integrating `developersConfig` into universal `LandingBlocks`.
 */
export default function DevelopersLanding() {
  const config = developersConfig;
  const HeroBadgeIcon = config.hero.badge.icon;
  const FeatureBadgeIcon = config.features.badge.icon;

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
              {config.hero.title.main} <br className="md:hidden" />
              <span className={`text-${config.theme}-600`}>{config.hero.title.highlight}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              {config.hero.description}
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

      {/* Analysis Section */}
      {config.analysis && (
        <section className="w-full bg-white py-20 px-4 md:px-8 border-t border-slate-100">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden order-2 lg:order-1">
              <img
                src={config.analysis.image}
                className="w-full h-auto opacity-90"
                alt="Architecture"
              />
              <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur rounded-xl border border-slate-200">
                <p className={`text-xs text-${config.theme}-600 uppercase tracking-wide`}>
                  {config.analysis.badge.split(' ')[0]} {config.analysis.badge.split(' ')[1]}
                </p>
                <p className="text-xl font-bold text-slate-900">{config.analysis.badge.split(' ')[2]}</p>
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

      {/* Pricing */}
      <section className="w-full bg-slate-50 py-20 px-4 md:px-8 border-t border-slate-100">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            خطط الاشتراك
          </h2>
        </div>
        <div className="max-w-6xl mx-auto">
          <PricingSection theme={config.theme} type="developer" />
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-white py-20 px-4 md:px-8 text-slate-900">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            الأسئلة الشائعة
          </h2>
        </div>
        <FAQSection questions={config.faqs} />
      </section>

      {/* CTA */}
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
            <Link to={config.cta.link}>{config.cta.buttonText}</Link>
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
}
