import { assertBrokerSession, assertDeveloperSession, requireBrokerSession, requireDeveloperSession } from "@/server/auth/guards";
import type { ResolvedSession } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import {
  projectAdLicenseInputSchema,
  projectBrokerAuthorizationInputSchema,
  projectComplianceDocumentInputSchema,
  projectDossierInputSchema,
  projectPaymentPlanInputSchema,
  projectUnitBulkActionSchema,
  projectUnitInputSchema,
  type ProjectAdLicenseInput,
  type ProjectBrokerAuthorizationInput,
  type ProjectComplianceDocumentInput,
  type ProjectDossierInput,
  type ProjectPaymentPlanInput,
  type ProjectUnitBulkAction,
  type ProjectUnitInput,
} from "@/server/contracts/projects";
import {
  convexBrokerProjectRepository,
  convexRedProjectRepository,
  type WorkspaceProjectRepository,
} from "@/server/infrastructure/convex/projects";

type WorkspaceProjectsDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  repository: WorkspaceProjectRepository;
  audience: "broker" | "developer";
};

function defaultDependencies(audience: "broker" | "developer"): WorkspaceProjectsDependencies {
  return audience === "broker"
    ? { audience, requireSession: requireBrokerSession, repository: convexBrokerProjectRepository }
    : { audience, requireSession: requireDeveloperSession, repository: convexRedProjectRepository };
}

async function requireWorkspaceSession(dependencies: WorkspaceProjectsDependencies) {
  const session = await dependencies.requireSession();
  return dependencies.audience === "broker" ? assertBrokerSession(session) : assertDeveloperSession(session);
}

function parseOrThrow<T>(parsed: { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } }, fallback: string): T {
  if (parsed.success) return parsed.data;
  throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? fallback, status: 400 });
}

/**
 * WHY:   Workspace pages need a project-domain service that does not leak Convex transport details.
 * WHAT:  Builds the audience-specific project dossier service for broker or developer workspaces.
 * HOW:   Validates public contracts, resolves the current workspace session, and delegates to the matching repository.
 */
export function buildWorkspaceProjectService(
  audience: "broker" | "developer",
  dependencies: WorkspaceProjectsDependencies = defaultDependencies(audience),
) {
  return {
    async getProjectDossier(input: { propertyId: string }) {
      const session = await requireWorkspaceSession(dependencies);
      return dependencies.repository.getProjectDossier(session.token, input.propertyId);
    },
    async getProjectReadiness(input: { propertyId: string }) {
      const session = await requireWorkspaceSession(dependencies);
      return dependencies.repository.getProjectReadiness(session.token, input.propertyId);
    },
    async saveProjectDossierDraft(input: ProjectDossierInput) {
      const parsed = parseOrThrow(projectDossierInputSchema.safeParse(input), "Invalid project dossier payload");
      const session = await requireWorkspaceSession(dependencies);
      return dependencies.repository.saveProjectDossierDraft(session.token, parsed);
    },
    async saveProjectUnits(input: { propertyId: string; units: ProjectUnitInput[] }) {
      const units = input.units.map((unit) => parseOrThrow(projectUnitInputSchema.safeParse(unit), "Invalid project unit payload"));
      const session = await requireWorkspaceSession(dependencies);
      return dependencies.repository.saveProjectUnits(session.token, input.propertyId, units);
    },
    async applyProjectUnitBulkActions(input: { propertyId: string; actions: ProjectUnitBulkAction[] }) {
      const actions = input.actions.map((action) => parseOrThrow(projectUnitBulkActionSchema.safeParse(action), "Invalid project unit bulk action"));
      const session = await requireWorkspaceSession(dependencies);
      return dependencies.repository.applyProjectUnitBulkActions(session.token, input.propertyId, actions);
    },
    async saveProjectPaymentPlans(input: { propertyId: string; paymentPlans: ProjectPaymentPlanInput[] }) {
      const paymentPlans = input.paymentPlans.map((plan) => parseOrThrow(projectPaymentPlanInputSchema.safeParse(plan), "Invalid payment plan payload"));
      const session = await requireWorkspaceSession(dependencies);
      return dependencies.repository.saveProjectPaymentPlans(session.token, input.propertyId, paymentPlans);
    },
    async saveProjectComplianceDocuments(input: { propertyId: string; documents: ProjectComplianceDocumentInput[] }) {
      const documents = input.documents.map((document) => parseOrThrow(projectComplianceDocumentInputSchema.safeParse(document), "Invalid project document payload"));
      const session = await requireWorkspaceSession(dependencies);
      return dependencies.repository.saveProjectComplianceDocuments(session.token, input.propertyId, documents);
    },
    async saveProjectAdLicense(input: { propertyId: string; adLicense?: ProjectAdLicenseInput }) {
      const adLicense = input.adLicense ? parseOrThrow(projectAdLicenseInputSchema.safeParse(input.adLicense), "Invalid ad license payload") : undefined;
      const session = await requireWorkspaceSession(dependencies);
      return dependencies.repository.saveProjectAdLicense(session.token, input.propertyId, adLicense);
    },
    async saveProjectBrokerAuthorization(input: { propertyId: string; authorization?: ProjectBrokerAuthorizationInput }) {
      const authorization = input.authorization ? parseOrThrow(projectBrokerAuthorizationInputSchema.safeParse(input.authorization), "Invalid broker authorization payload") : undefined;
      const session = await requireWorkspaceSession(dependencies);
      return dependencies.repository.saveProjectBrokerAuthorization(session.token, input.propertyId, authorization);
    },
    async requestProjectPublication(input: { propertyId: string }) {
      const session = await requireWorkspaceSession(dependencies);
      return dependencies.repository.requestProjectPublication(session.token, input.propertyId);
    },
  };
}
