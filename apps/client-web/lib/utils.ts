import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * WHY:   The client web app needs one class-name helper for zone components without importing from another app.
 * WHAT:  Merges conditional Tailwind class values into a final string.
 * HOW:   Uses `clsx` for truthy filtering and `tailwind-merge` for conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
