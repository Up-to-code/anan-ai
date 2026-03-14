import { redirect } from "next/navigation";

/**
 * WHY:   The admin app root should collapse directly into the protected dashboard entrypoint.
 * WHAT:  Redirects `/` requests to `/dashboard`.
 * HOW:   Uses an immediate server redirect so the route stays thin and stateless.
 */
export default function HomePage() {
  redirect("/dashboard");
}
