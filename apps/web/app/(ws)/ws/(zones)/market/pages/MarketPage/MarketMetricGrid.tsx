import type { WorkspaceMarketPageModel } from "../../types/marketTypes";

type MetricCard = {
  label: string;
  value: string;
  note: string;
};

function buildMetricCards(model: WorkspaceMarketPageModel): MetricCard[] {
  return [
    {
      label: "Market demand",
      value: model.headline.demandSignals.toLocaleString("en-US"),
      note: "إشارات الطلب داخل الفترة المحددة",
    },
    {
      label: "Saved research",
      value: model.headline.researchRuns.toLocaleString("en-US"),
      note: "أبحاث محفوظة في نفس النطاق",
    },
    {
      label: "Live inventory",
      value: model.headline.inventoryCount.toLocaleString("en-US"),
      note: "المخزون الحالي وليس مخزوناً مقيداً بالتاريخ",
    },
    {
      label: "Avg. price",
      value: model.headline.averagePriceLabel ?? "غير كافٍ",
      note: "متوسط السعر للمخزون الحالي",
    },
  ];
}

/**
 * WHY:   The new market shell needs a Similarweb-style metric row that frames the analysis before the deeper charts.
 * WHAT:  Renders four compact metric cards for demand, saved research, live inventory, and average price.
 * HOW:   Derives the cards from the shared page model and keeps the presentation dense and dashboard-like.
 */
export default function MarketMetricGrid({ model }: { model: WorkspaceMarketPageModel }) {
  const cards = buildMetricCards(model);

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</div>
          <div className="mt-3 text-2xl font-bold text-foreground">{card.value}</div>
          <div className="mt-2 text-[12px] font-medium text-muted-foreground">{card.note}</div>
        </article>
      ))}
    </section>
  );
}
