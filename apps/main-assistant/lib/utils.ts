import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * WHY:   The app needs one class merge helper consistent with the rest of the monorepo.
 * WHAT:  Merges conditional and Tailwind classes into a single className string.
 * HOW:   Pipes values through `clsx` first, then resolves Tailwind conflicts via `twMerge`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
