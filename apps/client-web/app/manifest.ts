import type { MetadataRoute } from "next";

/**
 * WHY:   The standalone client surface should expose a web app manifest for installability and browser metadata.
 * WHAT:  Returns the buyer app web manifest.
 * HOW:   Uses a minimal bilingual-safe configuration without assuming final branded icons are ready yet.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anan Client Assistant",
    short_name: "Anan",
    description: "Search live properties, check financing, and request advisor follow-up.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
  };
}
