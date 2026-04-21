export function buildAuthorizeFlowPath(flowId: string, tenantOrgId?: string | null) {
  const params = new URLSearchParams({ flow: flowId });
  if (tenantOrgId) {
    params.set("org", tenantOrgId);
  }
  return `/oauth/authorize?${params.toString()}`;
}

export function buildSigninRedirectForFlow(flowId: string, tenantOrgId?: string | null) {
  return `/signin?returnTo=${encodeURIComponent(buildAuthorizeFlowPath(flowId, tenantOrgId))}`;
}
