import type { MetadataRoute } from "next";
import { marketingBrand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: marketingBrand.legalName,
    short_name: marketingBrand.name,
    description: "Multilingual marketing and SEO surface for Anan real estate operating infrastructure.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: marketingBrand.iconPath,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
