/**
 * WHY:   Brand assets need one canonical definition so navbar, footer, metadata, and manifests stay aligned.
 * WHAT:  Exposes the current marketing-brand asset references and public brand naming.
 * HOW:   Keeps today's asset paths centralized so the premium logo swap becomes a one-file change later.
 */
export const marketingBrand = {
  name: "Anan",
  legalName: "Anan Real Estate OS",
  alternateNames: ["Anan", "عنان", "Anan OS"],
  logoPath: "/brand-logo.svg",
  iconPath: "/brand-logo.svg",
  ogImagePath: "/brand-logo.svg",
} as const;

