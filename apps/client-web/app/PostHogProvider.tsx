"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { usePathname, useSearchParams } from "next/navigation";
import { api } from "@/lib/convexApi";
import {
  capturePostHogEvent,
  extractAnalyticsDataset,
  identifyPostHogUser,
  initializePostHog,
  resetPostHogUser,
} from "@/lib/posthog";

function buildRoute(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * WHY:   Buyer funnels span guest chat, authenticated handoff, and property navigation across the whole client app.
 * WHAT:  Boots PostHog, identifies authenticated buyers, and captures shared page/click/error analytics.
 * HOW:   Lives under the Convex client provider so it can reuse the existing authenticated session query.
 */
export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousRouteRef = useRef<string | null>(null);
  const identifiedUserRef = useRef<string | null>(null);
  const sessionUser = useQuery(api.shared_logic.users.session.getSessionUser, {});

  useEffect(() => {
    initializePostHog({
      token: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    });
  }, []);

  useEffect(() => {
    if (sessionUser?.id) {
      identifyPostHogUser(sessionUser.id);
      identifiedUserRef.current = sessionUser.id;
      return;
    }

    if (sessionUser === null && identifiedUserRef.current) {
      resetPostHogUser();
      identifiedUserRef.current = null;
    }
  }, [sessionUser]);

  useEffect(() => {
    const route = buildRoute(pathname, searchParams);

    capturePostHogEvent("client_web_page_viewed", {
      path: pathname,
      route,
      isAuthenticated: Boolean(sessionUser?.id),
    });

    if (previousRouteRef.current && previousRouteRef.current !== route) {
      capturePostHogEvent("client_web_route_changed", {
        from: previousRouteRef.current,
        to: route,
        isAuthenticated: Boolean(sessionUser?.id),
      });
    }

    previousRouteRef.current = route;
  }, [pathname, searchParams, sessionUser?.id]);

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
        isAuthenticated: Boolean(sessionUser?.id),
        ...tracked.properties,
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname, sessionUser?.id]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      capturePostHogEvent("client_web_exception", {
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

      capturePostHogEvent("client_web_unhandled_rejection", {
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
