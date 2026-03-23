"use server";

import { redirect } from "next/navigation";
import {
  approveAuthorizationForCurrentUser,
  getAuthorizationPromptForCurrentUser,
} from "@/server/domains/auth/oauth/service";
import { getOptionalSessionContext } from "@/server/auth/session";
import { buildSigninRedirectForFlow } from "./authorize.shared";

function getFlowId(boundFlowId: string, formData: FormData) {
  return String(formData.get("flowId") ?? boundFlowId);
}

async function requireAuthorizationSession(flowId: string) {
  if (!flowId) {
    redirect("/signin");
  }

  if (!await getOptionalSessionContext()) {
    redirect(buildSigninRedirectForFlow(flowId));
  }
}

export async function approveAuthorizationAction(boundFlowId: string, formData: FormData) {
  const flowId = getFlowId(boundFlowId, formData);
  await requireAuthorizationSession(flowId);
  redirect((await approveAuthorizationForCurrentUser(flowId)).redirectUrl);
}

export async function denyAuthorizationAction(boundFlowId: string, formData: FormData) {
  const flowId = getFlowId(boundFlowId, formData);
  await requireAuthorizationSession(flowId);
  const prompt = await getAuthorizationPromptForCurrentUser(flowId);
  const destination = new URL(prompt.redirectUri);

  destination.searchParams.set("error", "access_denied");
  destination.searchParams.set("state", prompt.state);
  redirect(destination.toString());
}
