import { banks } from "@/admin_zone/mocks/data";
import BanksPageClient from "./BanksPageClient";

/**
 * WHY:   The banks route is a thin entrypoint into the mocked finance catalog.
 * WHAT:  Renders the banks page using the shared mock repository.
 * HOW:   Passes the mock bank records into the interactive client component.
 */
export default function BanksPage() {
  return <BanksPageClient banks={banks} />;
}

