import MarketRouteTabs from "./shared/navigation/MarketRouteTabs";

/**
 * WHY:   Market routes need local route tabs but should not recreate the shared workspace shell on navigation.
 * WHAT:  Renders the market-specific wrapper and tabs inside the persistent `/ws` shell.
 * HOW:   Keeps only the market content chrome here while the parent layout owns header/sidebar state.
 */
export default async function MarketZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-slot="market-shell" className="flex min-h-full flex-col bg-background text-foreground">
      <MarketRouteTabs />
      <div className="flex-1">{children}</div>
    </div>
  );
}
