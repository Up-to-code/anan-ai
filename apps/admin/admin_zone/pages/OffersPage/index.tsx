import { offers } from "@/admin_zone/mocks/data";
import OffersPageClient from "./OffersPageClient";

/**
 * WHY:   The offers route should remain a thin entrypoint into the mocked review queue.
 * WHAT:  Loads the mock offers list and renders the offers page.
 * HOW:   Delegates filter and navigation behavior to the client component.
 */
export default function OffersPage() {
  return <OffersPageClient offers={offers} />;
}

