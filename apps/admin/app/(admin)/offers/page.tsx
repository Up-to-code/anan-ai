import OffersPage from "@/admin_zone/pages/OffersPage";

/**
 * WHY:   The offers route should stay focused on routing only.
 * WHAT:  Renders the mocked offers review queue.
 * HOW:   Delegates the actual UI to the offers page module.
 */
export default function OffersRoute() {
  return <OffersPage />;
}

