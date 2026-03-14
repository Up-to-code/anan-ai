import { assertDeveloperSession, requireDeveloperSession } from "@/server/auth/guards";
import { type ResolvedSession } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import {
  createPropertyInputSchema,
  propertyListFiltersSchema,
  type CreatePropertyInput,
  type PaginatedPropertiesResult,
  type PropertyDetail,
  type PropertyListFilters,
  type PublishPropertyResult,
  type UpdatePropertyInput,
  updatePropertyInputSchema,
} from "@/server/contracts/properties";
import {
  convexRedZoneRepository,
  type RedZoneRepository,
} from "@/server/infrastructure/convex/redZoneRepository";

type RedPropertiesDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  repository: Pick<
    RedZoneRepository,
    "listProperties" | "getProperty" | "createProperty" | "updateProperty" | "deleteProperty" | "publishProperty"
  >;
};

const defaultDependencies: RedPropertiesDependencies = {
  requireSession: requireDeveloperSession,
  repository: convexRedZoneRepository,
};

async function requireRedOwnerId(
  dependencies: Pick<RedPropertiesDependencies, "requireSession">,
) : Promise<string> {
  const session = assertDeveloperSession(await dependencies.requireSession());
  const redId = session.context.redId;
  if (!redId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Developer profile required", status: 403 });
  }
  return redId;
}

async function requireOwnedRedProperty(
  propertyId: string,
  dependencies: RedPropertiesDependencies,
): Promise<PropertyDetail> {
  const redId = await requireRedOwnerId(dependencies);
  const property = await dependencies.repository.getProperty(propertyId);
  if (!property) {
    throw new DomainError({
      code: "NOT_FOUND",
      message: "Property not found",
      status: 404,
    });
  }
  if (property.REDId !== redId) {
    throw new DomainError({
      code: "FORBIDDEN",
      message: "Cannot access this property",
      status: 403,
    });
  }
  return property;
}

/**
 * WHY:   Developer pages need a server-owned paginated property listing path.
 * WHAT:  Returns paginated RED properties for the current authenticated developer.
 * HOW:   Validates filters, resolves the RED owner id, and delegates listing to the repository.
 */
export async function listRedProperties(
  input: PropertyListFilters,
  dependencies: RedPropertiesDependencies = defaultDependencies,
): Promise<PaginatedPropertiesResult> {
  const parsed = propertyListFiltersSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid property list filters",
      status: 400,
    });
  }
  const redId = await requireRedOwnerId(dependencies);
  return dependencies.repository.listProperties(redId, parsed.data);
}

/**
 * WHY:   Developer pages need a server-owned property detail path with ownership enforcement.
 * WHAT:  Returns one RED-owned property by id.
 * HOW:   Loads the property from the repository and rejects when it is missing or not RED-owned.
 */
export async function getRedProperty(
  input: { id: string },
  dependencies: RedPropertiesDependencies = defaultDependencies,
): Promise<PropertyDetail> {
  return requireOwnedRedProperty(input.id, dependencies);
}

/**
 * WHY:   RED property creation should run as a validated server function instead of a direct Convex mutation call.
 * WHAT:  Creates a new RED-owned property for the current session.
 * HOW:   Validates the payload, resolves the RED owner id, and calls the repository create primitive.
 */
export async function createRedProperty(
  input: CreatePropertyInput,
  dependencies: RedPropertiesDependencies = defaultDependencies,
): Promise<string> {
  const parsed = createPropertyInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid property payload",
      status: 400,
    });
  }
  const redId = await requireRedOwnerId(dependencies);
  return dependencies.repository.createProperty(redId, parsed.data);
}

/**
 * WHY:   RED property updates must enforce ownership before mutating persisted data.
 * WHAT:  Updates a RED-owned property by id.
 * HOW:   Validates the patch, confirms ownership through the repository, then applies the update.
 */
export async function updateRedProperty(
  input: { id: string; patch: UpdatePropertyInput },
  dependencies: RedPropertiesDependencies = defaultDependencies,
): Promise<void> {
  const parsed = updatePropertyInputSchema.safeParse(input.patch);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid property patch",
      status: 400,
    });
  }
  await requireOwnedRedProperty(input.id, dependencies);
  await dependencies.repository.updateProperty(input.id, parsed.data);
}

/**
 * WHY:   RED property deletion must enforce ownership before mutating persisted data.
 * WHAT:  Deletes a RED-owned property by id.
 * HOW:   Confirms ownership through the repository, then deletes the property.
 */
export async function deleteRedProperty(
  input: { id: string },
  dependencies: RedPropertiesDependencies = defaultDependencies,
): Promise<void> {
  await requireOwnedRedProperty(input.id, dependencies);
  await dependencies.repository.deleteProperty(input.id);
}

/**
 * WHY:   RED property publication must enforce ownership before changing visibility state.
 * WHAT:  Publishes a RED-owned property by id.
 * HOW:   Confirms ownership through the repository, then delegates the publish mutation.
 */
export async function publishRedProperty(
  input: { id: string },
  dependencies: RedPropertiesDependencies = defaultDependencies,
): Promise<PublishPropertyResult> {
  await requireOwnedRedProperty(input.id, dependencies);
  return dependencies.repository.publishProperty(input.id);
}
