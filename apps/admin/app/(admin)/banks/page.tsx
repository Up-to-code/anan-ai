import BanksPage from "@/admin_zone/pages/BanksPage";

/**
 * WHY:   The banks route should stay thin.
 * WHAT:  Renders the mocked banks catalog page.
 * HOW:   Hands off directly to the page module.
 */
export default function BanksRoute() {
  return <BanksPage />;
}

