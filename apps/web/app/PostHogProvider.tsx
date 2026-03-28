"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { capturePostHogEvent, extractAnalyticsDataset, initializePostHog } from "@/lib/posthog";

function buildRoute(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * WHY:   The web app needs one root-level analytics bridge for page views, route changes, CTA clicks, and client errors.
 * WHAT:  Initializes PostHog and captures shared browser analytics for the whole Next.js surface.
 * HOW:   Watches route changes, listens for delegated clicks on `data-analytics-*` elements, and records global errors.
 */
export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousRouteRef = useRef<string | null>(null);

  useEffect(() => {
    initializePostHog({
      token: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      appName: "web",
    });
  }, []);

  useEffect(() => {
    const route = buildRoute(pathname, searchParams);

    capturePostHogEvent("web_page_viewed", {
      path: pathname,
      route,
    });

    if (previousRouteRef.current && previousRouteRef.current !== route) {
      capturePostHogEvent("web_route_changed", {
        from: previousRouteRef.current,
        to: route,
      });
    }

    previousRouteRef.current = route;
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const trackedElement = target.closest<HTMLElement>("[data-analytics-event]");
      if (!trackedElement) return;

      const tracked = extractAnalyticsDataset(trackedElement);
      if (!tracked) return;

      capturePostHogEvent(tracked.event, {
        path: pathname,
        ...tracked.properties,
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      capturePostHogEvent("web_client_exception", {
        path: pathname,
        message: event.message || "unknown_error",
        source: event.filename || "unknown_source",
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error
          ? event.reason.message
          : typeof event.reason === "string"
            ? event.reason
            : "unknown_rejection";

      capturePostHogEvent("web_unhandled_rejection", {
        path: pathname,
        reason,
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [pathname]);

  return children;
}
