"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  History,
  MapPin,
  Menu,
  MessageSquare,
  Mic,
  Percent,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import type {
  BuyerAgUiTurn,
  BuyerAssistantCard,
  BuyerAssistantMessage,
  BuyerProperty,
  BuyerThreadSummary,
} from "../../../../../packages/client-assistant/src/index";
import {
  buildPropertySuggestedPrompts,
  formatCurrency,
  formatPercent,
  getPropertyHeroImage,
  getPropertyLocationLabel,
} from "../lib/mobileWebData";

/**
 * WHY:   The mobile-web layer reuses the same utility class composition across many screens and cards.
 * WHAT:  Joins conditional Tailwind class strings into a single className.
 * HOW:   Filters falsey values so callers can compose visual variants without branching markup repeatedly.
 */
export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function buildPropertyDetailHref(propertyId: string | number, activeThreadId?: string | null) {
  return activeThreadId ? `/app/property/${propertyId}?threadId=${activeThreadId}` : `/app/property/${propertyId}`;
}

/**
 * WHY:   Every buyer-facing route should sit inside one constrained mobile-like frame instead of the old desktop workspace shell.
 * WHAT:  Wraps screen content in a centered mobile-width layout with the same slate background used by the mobile app.
 * HOW:   Applies one shared outer canvas plus an inner max-width column so every screen feels like the same product.
 */
export function MobileViewport({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="min-h-dvh bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className={cn("mx-auto flex min-h-dvh w-full max-w-[440px] flex-col", className)}>{children}</div>
    </main>
  );
}

/**
 * WHY:   The mobile buyer app relies on one compact brand mark in the header and welcome screen.
 * WHAT:  Renders the simplified Anan SVG mark for the web port.
 * HOW:   Uses the same navy and blue geometry as the mobile component with a configurable pixel size.
 */
export function AnanMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="34" stroke="#D7E3F4" strokeWidth="2.5" />
      <path d="M48 22V35" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M74 48H61" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M48 74V61" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M22 48H35" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="48" cy="22" r="4.25" fill="#0F172A" />
      <circle cx="74" cy="48" r="4.25" fill="#0F172A" />
      <circle cx="48" cy="74" r="4.25" fill="#0F172A" />
      <circle cx="22" cy="48" r="4.25" fill="#0F172A" />
      <rect x="37" y="37" width="22" height="22" rx="4.5" fill="#0F172A" />
      <path d="M42.5 56L48 42.5L53.5 56" stroke="white" strokeWidth="3.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45.5 50.3H50.5" stroke="white" strokeWidth="3.25" strokeLinecap="round" />
    </svg>
  );
}

/**
 * WHY:   The mobile UI depends on circular icon affordances for headers and search actions.
 * WHAT:  Renders a circular icon button in light, panel, or ghost variants.
 * HOW:   Keeps the geometry fixed and only swaps border/background treatment to mirror the mobile button family.
 */
export function MobileIconButton({
  icon: Icon,
  href,
  onClick,
  label,
  tone = "panel",
  size = "default",
  className,
}: {
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  label: string;
  tone?: "light" | "panel" | "ghost";
  size?: "sm" | "default";
  className?: string;
}) {
  const baseClassName = cn(
    "inline-flex items-center justify-center rounded-full transition active:scale-95",
    size === "sm" ? "h-10 w-10" : "h-12 w-12",
    tone === "panel" && "border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200",
    tone === "light" && "bg-white/95 text-slate-600 shadow-md dark:bg-slate-900/95 dark:text-slate-100",
    tone === "ghost" && "bg-transparent text-slate-600 dark:text-slate-200",
    className,
  );

  const content = <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />;

  if (href) {
    return (
      <Link aria-label={label} href={href} className={baseClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} onClick={onClick} className={baseClassName}>
      {content}
    </button>
  );
}

/**
 * WHY:   The mobile app uses a single rounded CTA style across welcome, property, and handoff actions.
 * WHAT:  Renders a full-width or inline action button with primary or secondary treatment.
 * HOW:   Applies the same pill geometry and Cairo-heavy typography while allowing link or button usage.
 */
export function MobileButton({
  label,
  href,
  onClick,
  variant = "primary",
  className,
  disabled,
  type = "button",
  testId,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  testId?: string;
}) {
  const baseClassName = cn(
    "inline-flex min-h-14 items-center justify-center rounded-full px-6 text-center text-[16px] font-black tracking-tight transition active:scale-[0.98]",
    variant === "primary"
      ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950"
      : "border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50",
    disabled && "pointer-events-none opacity-50",
    className,
  );

  if (href) {
    return (
      <Link data-testid={testId} href={href} className={baseClassName}>
        {label}
      </Link>
    );
  }

  return (
    <button data-testid={testId} type={type} onClick={onClick} disabled={disabled} className={baseClassName}>
      {label}
    </button>
  );
}

/**
 * WHY:   The mobile search and assistant shortlist both present properties with the same compact card treatment.
 * WHAT:  Renders one buyer property card with hero image, facts, and quick actions.
 * HOW:   Keeps the mobile layout proportions and exposes assistant/detail actions via callbacks or links.
 */
export function PropertyResultCard({
  property,
  onAskAssistant,
  detailHref,
  detailTestId,
}: {
  property: BuyerProperty;
  onAskAssistant?: (property: BuyerProperty) => void;
  detailHref?: string;
  detailTestId?: string;
}) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-row-reverse gap-3 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getPropertyHeroImage(property)}
          alt={property.title}
          className="h-[110px] w-[104px] rounded-[20px] object-cover"
        />
        <div className="flex flex-1 flex-col justify-between py-1 text-right">
          <div>
            <h3 className="line-clamp-2 text-[16px] font-black text-slate-900 dark:text-slate-50">{property.title}</h3>
            <p className="mb-1 text-[13px] font-black text-blue-600">{formatCurrency(property.price)}</p>
          </div>
          <div className="mt-1 flex flex-row-reverse flex-wrap gap-2">
            <FactBadge icon={BedDouble} label={`${property.beds}`} />
            <FactBadge icon={Bath} label={`${property.baths}`} />
            <FactBadge icon={MapPin} label={getPropertyLocationLabel(property)} />
          </div>
        </div>
      </div>

      <div className="flex flex-row-reverse gap-2 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onAskAssistant?.(property)}
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-[13px] font-black text-slate-900 transition active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
        >
          اسأل المساعد
        </button>
        {detailHref ? (
          <Link
            data-testid={detailTestId}
            href={detailHref}
            className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-center text-[13px] font-black text-white transition active:scale-[0.98] dark:bg-slate-50 dark:text-slate-950"
          >
            عرض الوحدة
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function FactBadge({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}

/**
 * WHY:   The assistant history lives inside a temporary overlay in the mobile app rather than an always-visible sidebar.
 * WHAT:  Renders the mobile-style history sheet with recent threads and reset action.
 * HOW:   Uses a fixed backdrop and bottom-anchored panel so the interaction feels like the mobile slide-up sheet.
 */
export function HistorySheet({
  open,
  activeThreadId,
  threads,
  onClose,
  onSelect,
  onReset,
}: {
  open: boolean;
  activeThreadId?: string | null;
  threads: BuyerThreadSummary[];
  onClose: () => void;
  onSelect: (threadId: string) => void;
  onReset: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 px-4 pb-4 pt-16 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto flex h-full w-full max-w-[440px] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 text-right dark:border-slate-800">
          <button type="button" onClick={onReset} className="text-[13px] font-black text-blue-600">
            محادثة جديدة
          </button>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">السجل</p>
            <h2 className="text-[18px] font-black text-slate-900 dark:text-slate-50">سجل المحادثات</h2>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {threads.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-6 text-right dark:border-slate-800 dark:bg-slate-950">
              <p className="text-[16px] font-black text-slate-900 dark:text-slate-50">لا توجد محادثات محفوظة بعد</p>
              <p className="mt-2 text-[14px] leading-7 text-slate-500 dark:text-slate-400">
                ابدأ من المساعد ثم سيظهر آخر سياق هنا بنفس أسلوب الموبايل.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => onSelect(thread.id)}
                    className={cn(
                      "block w-full rounded-[28px] border px-5 py-4 text-right transition active:scale-[0.99]",
                      isActive
                        ? "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
                    )}
                  >
                    <p className="text-[15px] font-black text-slate-900 dark:text-slate-50">{thread.title}</p>
                    {thread.preview ? (
                      <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-slate-500 dark:text-slate-400">{thread.preview}</p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * WHY:   The assistant transcript is the centerpiece of the buyer journey and needs a reusable renderer.
 * WHAT:  Renders user bubbles, assistant cards, property rows, prompt chips, and a typing state in one mobile-style list.
 * HOW:   Keeps a strict right-to-left visual hierarchy and defers structured assistant content to `AgUiTurnRenderer`.
 */
export function MessageThread({
  messages,
  isSending,
  onSelectPrompt,
  onAskAboutProperty,
  activeThreadId,
}: {
  messages: BuyerAssistantMessage[];
  isSending?: boolean;
  onSelectPrompt: (prompt: string) => void;
  onAskAboutProperty: (property: BuyerProperty) => void;
  activeThreadId?: string | null;
}) {
  const latestPromptMessageId =
    messages
      .slice()
      .reverse()
      .find((message) => message.role === "assistant" && (message.suggestedPrompts?.length ?? 0) > 0)?.id ?? null;

  return (
    <div className="space-y-5 px-5 py-5">
      {messages.map((message) => {
        const prompts = message.suggestedPrompts ?? buildPropertySuggestedPrompts(message.properties?.[0] ?? null);

        return (
          <div key={message.id} className="space-y-4">
            {message.role === "user" ? (
              <div className="flex justify-start">
                <div className="max-w-[88%] rounded-[24px] rounded-bl-[14px] bg-slate-900 px-4 py-3 text-right text-[15px] font-medium leading-7 text-white dark:bg-slate-50 dark:text-slate-950">
                  {message.text}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-right">
                <div className="flex flex-row-reverse items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/30">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">مساعد عنان</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">ذكاء اصطناعي</span>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-[16px] font-bold leading-8 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
                  {message.text}
                </div>
              </div>
            )}

            {message.role === "assistant" ? (
              <>
                {message.uiTurn ? (
                  <AgUiTurnRenderer turn={message.uiTurn} onAskAboutProperty={onAskAboutProperty} activeThreadId={activeThreadId} />
                ) : null}
                {!message.uiTurn && message.properties?.length ? (
                  <div className="space-y-3">
                    {message.properties.map((property) => (
                      <PropertyResultCard
                        key={String(property.id)}
                        property={property}
                        onAskAssistant={onAskAboutProperty}
                        detailHref={buildPropertyDetailHref(String(property.id), activeThreadId)}
                        detailTestId="client-property-result-link"
                      />
                    ))}
                  </div>
                ) : null}
                {prompts.length > 0 && message.id === latestPromptMessageId ? (
                  <div className="flex flex-row-reverse gap-2 overflow-x-auto pb-1">
                    {prompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => onSelectPrompt(prompt)}
                        className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-3 text-[13px] font-black text-slate-900 shadow-sm transition active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        );
      })}

      {isSending ? (
        <div className="flex justify-end">
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-black text-blue-600 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            تحليل الطلب الآن...
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * WHY:   Structured assistant turns must render like the mobile AG UI rather than generic markdown blocks.
 * WHAT:  Maps AG UI cards into shortlist, metric cards, bank offers, and next-step panels.
 * HOW:   Uses a small component registry keyed by `componentId` so the web port follows the same turn contract as mobile.
 */
export function AgUiTurnRenderer({
  turn,
  onAskAboutProperty,
  activeThreadId,
}: {
  turn: BuyerAgUiTurn;
  onAskAboutProperty: (property: BuyerProperty) => void;
  activeThreadId?: string | null;
}) {
  return (
    <div className="space-y-3">
      {turn.cards.map((card) => {
        if (card.componentId === "property_shortlist") {
          const properties = ((card.props.properties as BuyerProperty[]) ?? []).map((property) => property);
          return (
            <div key={card.id} data-testid="client-ag-ui-card-property_shortlist" className="space-y-3">
              {properties.map((property) => (
                <PropertyResultCard
                  key={String(property.id)}
                  property={property}
                  onAskAssistant={onAskAboutProperty}
                  detailHref={buildPropertyDetailHref(String(property.id), activeThreadId)}
                  detailTestId="client-property-result-link"
                />
              ))}
            </div>
          );
        }

        if (card.componentId === "bank_offer") {
          return (
            <InsightShell key={card.id} dataTestId="client-ag-ui-card-bank_offer" title={String(card.props.title ?? "عرض بنكي")} icon={Wallet}>
              <MetricRow label="البنك" value={String(card.props.bankName ?? "—")} emphasized />
              <MetricRow label="البرنامج" value={String(card.props.rateLabel ?? "—")} />
              <MetricRow label="الدفعة الأولى" value={`${String(card.props.downPaymentPercent ?? "—")}%`} />
              <MetricRow label="القسط الشهري التقريبي" value={formatCurrency(Number(card.props.monthlyEstimate ?? 0))} />
              <CardSummary text={String(card.props.summary ?? "")} />
            </InsightShell>
          );
        }

        if (card.componentId === "followup_prompt") {
          return (
            <div key={card.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="px-4 py-4 text-right">
                <h3 className="text-[16px] font-black text-slate-900 dark:text-slate-50">{String(card.props.title ?? "الخطوة التالية")}</h3>
                <p className="mt-2 text-[14px] leading-7 text-slate-500 dark:text-slate-400">{String(card.props.summary ?? "")}</p>
              </div>
              <div className="border-t border-slate-100 px-4 py-4 dark:border-slate-800">
                <button data-testid="client-request-advisor" type="button" className="w-full rounded-full bg-slate-900 px-4 py-3 text-[14px] font-black text-white dark:bg-slate-50 dark:text-slate-950">
                  {String(card.props.actionLabel ?? "اطلب مستشاراً")}
                </button>
              </div>
            </div>
          );
        }

        return <AssistantInsightCard key={card.id} componentId={card.componentId} rawCard={card.props as BuyerAssistantCard} />;
      })}
    </div>
  );
}

function AssistantInsightCard({
  componentId,
  rawCard,
}: {
  componentId: string;
  rawCard: BuyerAssistantCard;
}) {
  if (componentId === "loan_calculator") {
    const card = rawCard as Extract<BuyerAssistantCard, { type: "loan_calculator" }>;
    return (
      <InsightShell dataTestId="client-ag-ui-card-loan_calculator" title={card.title} icon={Calculator}>
        <MetricRow label="قيمة العقار" value={formatCurrency(card.propertyPrice)} />
        <MetricRow label="الدفعة الأولى" value={formatCurrency(card.downPayment)} />
        <MetricRow label="التمويل" value={formatCurrency(card.loanAmount)} />
        <MetricRow label="القسط الشهري المتوقع" value={formatCurrency(card.monthlyPayment)} emphasized />
        <CardSummary text={card.summary} />
      </InsightShell>
    );
  }

  if (componentId === "roi_projection") {
    const card = rawCard as Extract<BuyerAssistantCard, { type: "roi_projection" | "roi_summary" }>;
    const annualRent = "annualRent" in card ? card.annualRent : card.estimatedAnnualRent;
    const yieldPercent = "yieldPercent" in card ? card.yieldPercent : card.grossYieldPercent;
    return (
      <InsightShell title={card.title} icon={Percent}>
        <MetricRow label="سعر الشراء" value={formatCurrency(card.purchasePrice)} />
        <MetricRow label="الإيجار السنوي" value={formatCurrency(annualRent)} />
        <MetricRow label="العائد" value={formatPercent(yieldPercent)} emphasized />
        <CardSummary text={card.summary} />
      </InsightShell>
    );
  }

  if (componentId === "comparison_table") {
    const card = rawCard as Extract<BuyerAssistantCard, { type: "comparison_table" }>;
    return (
      <InsightShell title={card.title} icon={MessageSquare}>
        <div className="overflow-hidden rounded-[20px] border border-slate-100 dark:border-slate-800">
          {card.rows.map((row, index) => (
            <div key={`${row.join("-")}-${index}`} className="grid grid-cols-2 border-b border-slate-100 bg-white px-4 py-3 text-right last:border-b-0 dark:border-slate-800 dark:bg-slate-900">
              {row.map((value, rowIndex) => (
                <div key={`${value}-${rowIndex}`} className={cn("text-[13px]", rowIndex === 0 ? "font-black text-slate-400" : "font-bold text-slate-900 dark:text-slate-50")}>
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>
        <CardSummary text={card.summary} />
      </InsightShell>
    );
  }

  if (componentId === "broker_profile") {
    const card = rawCard as Extract<BuyerAssistantCard, { type: "broker_profile" }>;
    return (
      <InsightShell title={card.title} icon={User}>
        <MetricRow label="الوسيط" value={card.brokerName} emphasized />
        <MetricRow label="الجهة" value={card.brokerAgency} />
        <MetricRow label="التقييم" value={`${card.rating} / 5`} />
        <MetricRow label="وحدات نشطة" value={`${card.activeListings}`} />
        <CardSummary text={card.summary} />
      </InsightShell>
    );
  }

  if (componentId === "developer_profile") {
    const card = rawCard as Extract<BuyerAssistantCard, { type: "developer_profile" }>;
    return (
      <InsightShell title={card.title} icon={Building2}>
        <MetricRow label="المطور" value={card.developerName} emphasized />
        <MetricRow label="سنة التأسيس" value={`${card.establishedYear}`} />
        <MetricRow label="مشاريع منجزة" value={`${card.completedProjects}`} />
        <CardSummary text={card.summary} />
      </InsightShell>
    );
  }

  if (componentId === "permit_status") {
    const card = rawCard as Extract<BuyerAssistantCard, { type: "permit_status" }>;
    return (
      <InsightShell title={card.title} icon={ShieldCheck}>
        <MetricRow
          label="التحقق"
          value={card.permitStatus === "verified" ? "موثق" : card.permitStatus === "pending_review" ? "قيد المراجعة" : "غير متاح"}
          emphasized
        />
        <CardSummary text={card.summary} />
      </InsightShell>
    );
  }

  if (componentId === "market_analysis") {
    const card = rawCard as Extract<BuyerAssistantCard, { type: "market_analysis" }>;
    return (
      <InsightShell title={card.title} icon={TrendingUp}>
        <MetricRow label="المنطقة" value={card.location} emphasized />
        <MetricRow label="متوسط السعر" value={formatCurrency(card.averagePrice)} />
        <MetricRow label="الاتجاه" value={`${card.priceTrend === "up" ? "▲" : card.priceTrend === "down" ? "▼" : "—"} ${card.trendPercentage}%`} />
        <CardSummary text={card.summary} />
      </InsightShell>
    );
  }

  if (componentId === "insight_brief") {
    const card = rawCard as Extract<BuyerAssistantCard, { type: "insight_brief" }>;
    return (
      <InsightShell title={card.title} icon={CheckCircle2}>
        <p className="text-right text-[14px] leading-7 text-slate-600 dark:text-slate-300">{card.body}</p>
        <CardSummary text={card.summary} />
      </InsightShell>
    );
  }

  if (componentId === "accent_note") {
    const card = rawCard as Extract<BuyerAssistantCard, { type: "accent_note" }>;
    return (
      <InsightShell title={card.title} icon={CheckCircle2}>
        <MetricRow label="الحالة" value={card.tone === "success" ? "إيجابي" : card.tone === "warning" ? "تنبيه" : "معلومة"} emphasized />
        <CardSummary text={card.summary} />
      </InsightShell>
    );
  }

  if (componentId === "mortgage_check") {
    const card = rawCard as Extract<BuyerAssistantCard, { type: "mortgage_check" }>;
    return (
      <InsightShell title={card.title} icon={Wallet}>
        <MetricRow
          label="الحالة"
          value={card.estimatedEligibility === "eligible" ? "مؤهل" : card.estimatedEligibility === "review" ? "مراجعة" : "معلومات غير كافية"}
          emphasized
        />
        {card.recommendedBudget ? <MetricRow label="ميزانية مقترحة" value={formatCurrency(card.recommendedBudget)} /> : null}
        {card.monthlyInstallmentEstimate ? <MetricRow label="قسط تقريبي" value={formatCurrency(card.monthlyInstallmentEstimate)} /> : null}
        <CardSummary text={card.summary} />
      </InsightShell>
    );
  }

  return null;
}

function InsightShell({
  title,
  icon: Icon,
  children,
  dataTestId,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  dataTestId?: string;
}) {
  return (
    <section data-testid={dataTestId} className="rounded-[28px] border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-row-reverse items-center gap-2 text-right">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/30">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-[15px] font-black text-slate-900 dark:text-slate-50">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex flex-row-reverse items-center justify-between gap-3 rounded-full bg-slate-50 px-4 py-3 text-right dark:bg-slate-800/60">
      <span className="text-[12px] font-black uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <span className={cn("text-[14px] font-bold text-slate-700 dark:text-slate-200", emphasized && "font-black text-slate-900 dark:text-slate-50")}>
        {value}
      </span>
    </div>
  );
}

function CardSummary({ text }: { text: string }) {
  return <p className="text-right text-[14px] leading-7 text-slate-500 dark:text-slate-400">{text}</p>;
}

/**
 * WHY:   Several mobile screens reuse the same dense top app bar layout.
 * WHAT:  Renders a header with left/right actions and a centered title block.
 * HOW:   Keeps the spacing, typography, and icon affordances consistent across the mobile-style screens.
 */
export function MobileHeader({
  title,
  onBack,
  backHref,
  rightSlot,
}: {
  title: string;
  onBack?: () => void;
  backHref?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 pb-4 pt-5">
      <div>{rightSlot ?? <span className="block h-12 w-12" />}</div>
      <h1 className="text-[18px] font-black text-slate-900 dark:text-slate-50">{title}</h1>
      <MobileIconButton icon={ArrowLeft} onClick={onBack} href={backHref} label="رجوع" tone="panel" />
    </div>
  );
}

export const MobileIcons = {
  Calculator,
  ChevronLeft,
  History,
  MapPin,
  Menu,
  Mic,
  Search,
  Star,
  User,
};
