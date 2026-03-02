import { Link } from "react-router-dom";
import { Button } from "@/public_zone/ui/button";
import { LandingLayout } from "@/public_zone/landing/LandingLayout";
import {
  BentoFeatureGrid,
  PricingSection,
  FAQSection,
  AIChatInput,
  PartnerMarquee,
} from "@/public_zone/landing/LandingBlocks";
import { brokersConfig } from "@/_core/config/landingContent";
/**
 * WHY:   Presents a tailored value proposition specifically to real estate brokers.
 * WHAT:  Displays the hero section, features, pricing, and FAQ targeting broker acquisition.
 * HOW:   Designed as an Orchestrator. Parses the static `brokersConfig` and renders `LandingBlocks`.
 */
export default function BrokersLanding() {
  const config = brokersConfig;
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

      {/* Pricing */}
      <section className="w-full bg-white py-20 px-4 md:px-8 border-t border-slate-100">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            خطط الاشتراك
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            اختر الباقة التي تتناسب مع حجم أعمالك.
          </p>
        </div>
        <div className="max-w-6xl mx-auto">
          <PricingSection theme={config.theme} type="broker" />
        </div>
      </section>

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
            <Link to={config.cta.link}>{config.cta.buttonText}</Link>
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
}
