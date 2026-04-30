import { createAnanAuthBridge } from "@anan/auth/server";

export { resolveAuthBridgeConfig } from "@anan/auth/server";

const authBridge = createAnanAuthBridge();

export const handler = authBridge.handler;
export const getToken = authBridge.getToken;
export const preloadAuthQuery = authBridge.preloadAuthQuery;
export const isAuthenticated = authBridge.isAuthenticated;
export const fetchAuthQuery = authBridge.fetchAuthQuery;
export const fetchAuthMutation = authBridge.fetchAuthMutation;
export const fetchAuthAction = authBridge.fetchAuthAction;
