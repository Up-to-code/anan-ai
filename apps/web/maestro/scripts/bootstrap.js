const baseUrl = (process.env.MAESTRO_WEB_URL || "http://localhost:3000").replace(/\/$/u, "");
const secret = process.env.E2E_SHARED_SECRET || "";
const persona = process.env.E2E_PERSONA || "broker-manager";
const redirectTo = process.env.E2E_REDIRECT_TO || "/ws";
const namespace = process.env.E2E_NAMESPACE || `e2e-maestro-${Date.now().toString(36)}`;

output.bootstrapUrl = `${baseUrl}/api/e2e/session?persona=${encodeURIComponent(persona)}&secret=${encodeURIComponent(secret)}&namespace=${encodeURIComponent(namespace)}&redirectTo=${encodeURIComponent(redirectTo)}`;
output.namespace = namespace;
output.projectName = `${namespace} مشروع`;
output.unitName = `${namespace} وحدة`;
output.inviteeEmail = process.env.E2E_PERSONA_INVITEE_EMAIL || `invitee+${namespace}@example.test`;

