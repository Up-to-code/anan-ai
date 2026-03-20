import type { NextRequest } from "next/server";

export function parseThreadListLimit(request: NextRequest) {
  const rawLimit = request.nextUrl.searchParams.get("limit");
  const parsedLimit = rawLimit ? Number(rawLimit) : NaN;
  if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
    return 12;
  }
  return Math.min(Math.floor(parsedLimit), 50);
}

export function shouldListThreads(request: NextRequest) {
  return request.nextUrl.searchParams.get("list") === "threads";
}

export function serializeSseEvent(event: string, payload: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
