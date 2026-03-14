import MarketPage from "./MarketPage";
import MarketOverviewPreview from "./MarketPage/MarketOverviewPreview";
import { loadMarketPageModel } from "./loadMarketPageModel";

type MarketPageProps = {
  searchParams: Promise<{
    city?: string | string[];
    area?: string | string[];
    query?: string | string[];
    windowDays?: string | string[];
  }>;
};

/**
 * WHY:   The market root needs a dedicated landing page again, but the full overview experience is not ready for release yet.
 * WHAT:  Renders the main market page using the shared market wrapper plus the overview preview content.
 * HOW:   Loads the current market snapshot through the shared page model while leaving the shared under-development treatment to `MarketPage`.
 */
export default async function WorkspaceMarketRoute({ searchParams }: MarketPageProps) {
  const model = await loadMarketPageModel(searchParams);
  const isUnderDevelopment =
    String(
      (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process
        ?.env?.NEXT_PUBLIC_MARKET_UNDER_DEVELOPMENT ?? "",
    ).toLowerCase() === "true";

  return (
    <MarketPage
      model={model}
      actionPath="/ws/market"
      intro={{
        eyebrow: "ذكاء السوق",
        title: "نظرة السوق",
        description: isUnderDevelopment
          ? "هذه الصفحة تمثل الواجهة الشاملة القادمة لذكاء السوق، وتُعرض حالياً كمعاينة أثناء التطوير."
          : "نظرة شاملة على إشارات الطلب والأبحاث والمخزون ضمن النطاق الحالي، مع إمكانية تصفح التحليلات عبر التبويبات.",
      }}
    >
      <MarketOverviewPreview model={model} />
    </MarketPage>
  );
}
