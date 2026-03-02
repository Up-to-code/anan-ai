/**
 * Channel detection – infer channel from request context.
 * Used after ingress to route to correct channel handler.
 */

import type { ChannelType } from "./auth";

export type ChannelDetection =
  | { channel: ChannelType; confidence: "high" | "medium" }
  | { channel: null; reason: string };

/** Detect WhatsApp webhook from request (e.g. path, headers). */
export function detectChannelFromRequest(params: {
  path?: string;
  headers?: Record<string, string>;
}): ChannelDetection {
  const path = (params.path ?? "").toLowerCase();
  if (path.includes("whatsapp") || path.includes("webhook")) {
    return { channel: "whatsapp", confidence: "high" };
  }
  const userAgent = params.headers?.["user-agent"] ?? "";
  if (userAgent.includes("WhatsApp")) {
    return { channel: "whatsapp", confidence: "medium" };
  }
  return { channel: null, reason: "Could not detect channel" };
}
