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

function getTenantOrgId(formData: FormData) {
  const tenantOrgId = formData.get("tenantOrgId");
  return typeof tenantOrgId === "string" && tenantOrgId.trim().length > 0 ? tenantOrgId.trim() : undefined;
}

async function requireAuthorizationSession(flowId: string, tenantOrgId?: string) {
  if (!flowId) {
    redirect("/signin");
  }

  if (!await getOptionalSessionContext()) {
    redirect(buildSigninRedirectForFlow(flowId, tenantOrgId));
  }
}

export async function approveAuthorizationAction(boundFlowId: string, formData: FormData) {
  const flowId = getFlowId(boundFlowId, formData);
  const tenantOrgId = getTenantOrgId(formData);
  await requireAuthorizationSession(flowId, tenantOrgId);
  const prompt = await getAuthorizationPromptForCurrentUser(flowId, tenantOrgId);
  if (!prompt.selectedTenantOrgId) {
    throw new Error("Organization selection is required");
  }
  redirect((await approveAuthorizationForCurrentUser(flowId, prompt.selectedTenantOrgId)).redirectUrl);
}

export async function denyAuthorizationAction(boundFlowId: string, formData: FormData) {
  const flowId = getFlowId(boundFlowId, formData);
  const tenantOrgId = getTenantOrgId(formData);
  await requireAuthorizationSession(flowId, tenantOrgId);
  const prompt = await getAuthorizationPromptForCurrentUser(flowId, tenantOrgId);
  const destination = new URL(prompt.redirectUri);

  destination.searchParams.set("error", "access_denied");
  destination.searchParams.set("state", prompt.state);
  redirect(destination.toString());
}
