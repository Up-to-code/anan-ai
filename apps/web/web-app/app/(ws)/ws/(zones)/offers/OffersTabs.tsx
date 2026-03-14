import RouteTabBar from "../../_components/Visuals/RouteTabBar";

export default function OffersTabs() {
  return (
    <RouteTabBar
      tabs={[
        { href: "/ws/offers", label: "جميع العروض" },
        { href: "/ws/offers/brokers", label: "ملفات الوسطاء" },
        { href: "/ws/offers/developers", label: "ملفات المطورين" },
        { href: "/ws/offers/search", label: "البحث المتقدم" },
      ]}
    />
  );
}
