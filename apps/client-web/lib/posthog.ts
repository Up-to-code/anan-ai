"use client";

import posthog from "posthog-js";

let isInitialized = false;

type AnalyticsPrimitive = string | number | boolean | null | undefined;

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * WHY:   The client web app needs one safe PostHog bridge for buyer funnel, property, and assistant analytics.
 * WHAT:  Initializes the browser SDK once and exposes tiny capture helpers for the rest of the app.
 * HOW:   Gracefully no-ops when env vars are missing and keeps payloads shallow and JSON-safe.
 */
export function initializePostHog({
  token,
  host,
}: {
  token?: string;
  host?: string;
}) {
  if (isInitialized) return;
  if (!token?.trim() || !host?.trim()) return;

  posthog.init(token.trim(), {
    api_host: trimTrailingSlash(host.trim()),
    capture_pageview: false,
    autocapture: false,
    persistence: "localStorage+cookie",
    person_profiles: "identified_only",
    loaded(instance) {
      instance.register({ app_name: "client-web" });
    },
  });

  isInitialized = true;
}

/**
 * WHY:   Funnel instrumentation should be reusable across hooks and components without repeated SDK guards.
 * WHAT:  Captures one PostHog event with optional JSON-safe properties.
 * HOW:   Removes undefined values before sending the payload to the shared singleton.
 */
export function capturePostHogEvent(
  event: string,
  properties: Record<string, AnalyticsPrimitive | string[]> = {},
) {
  if (!isInitialized) return;
  const payload = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
  posthog.capture(event, payload);
}

/**
 * WHY:   Authenticated buyers should keep one stable analytics identity across sessions.
 * WHAT:  Identifies the current browser session with the authenticated user id.
 * HOW:   Calls `identify` when a non-empty id is available.
 */
export function identifyPostHogUser(userId?: string | null) {
  if (!isInitialized) return;
  if (!userId?.trim()) return;
  posthog.identify(userId.trim());
}

/**
 * WHY:   Guest flows should remain anonymous until the user signs in.
 * WHAT:  Clears the current PostHog identity.
 * HOW:   Delegates to the shared SDK instance.
 */
export function resetPostHogUser() {
  if (!isInitialized) return;
  posthog.reset();
}

/**
 * WHY:   Server-rendered links can still describe conversion clicks through data attributes.
 * WHAT:  Extracts one analytics event and its properties from a clicked element.
 * HOW:   Reads `data-analytics-*` attributes and normalizes them into payload fields.
 */
export function extractAnalyticsDataset(element: HTMLElement) {
  const event = element.dataset.analyticsEvent;
  if (!event) return null;

  const properties: Record<string, AnalyticsPrimitive> = {};
  for (const [key, value] of Object.entries(element.dataset)) {
    if (!key.startsWith("analytics") || key === "analyticsEvent" || value === undefined) continue;
    const propertyName = key.slice("analytics".length);
    const normalizedName = propertyName.charAt(0).toLowerCase() + propertyName.slice(1);
    properties[normalizedName] = value;
  }

  return { event, properties };
}
