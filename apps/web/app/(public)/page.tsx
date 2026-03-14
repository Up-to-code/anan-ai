import LandingPage from "./LandingPage";

/**
 * WHY:   The public root route should stay thin while the landing experience grows in complexity.
 * WHAT:  Delegates the full landing-page render to the page-local LandingPage orchestrator.
 * HOW:   Imports the isolated landing module and returns it directly.
 */
export default function Home() {
  return <LandingPage />;
}
