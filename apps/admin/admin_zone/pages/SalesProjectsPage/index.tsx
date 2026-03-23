import { projects } from "@/admin_zone/mocks/data";
import ProjectsPageClient from "./ProjectsPageClient";

/**
 * WHY:   The projects route must stay focused on loading mocked records and delegating the UI to the page module.
 * WHAT:  Exposes the projects workspace for sales review.
 * HOW:   Passes the stable mock dataset into the client-side filtering surface.
 */
export default function SalesProjectsPage() {
  return <ProjectsPageClient projects={projects} />;
}

