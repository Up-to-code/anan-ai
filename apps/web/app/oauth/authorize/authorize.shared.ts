export function buildAuthorizeFlowPath(flowId: string) {
  return `/oauth/authorize?flow=${encodeURIComponent(flowId)}`;
}

export function buildSigninRedirectForFlow(flowId: string) {
  return `/signin?returnTo=${encodeURIComponent(buildAuthorizeFlowPath(flowId))}`;
}
