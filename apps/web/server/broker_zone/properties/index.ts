import { assertBrokerSession, requireBrokerSession } from "@/server/auth/guards";
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
  convexBrokerZoneRepository,
  type BrokerZoneRepository,
} from "@/server/infrastructure/convex/brokerZoneRepository";

type BrokerPropertiesDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  repository: Pick<
    BrokerZoneRepository,
    "listProperties" | "getProperty" | "createProperty" | "updateProperty" | "deleteProperty" | "publishProperty"
  >;
};

const defaultDependencies: BrokerPropertiesDependencies = {
  requireSession: requireBrokerSession,
  repository: convexBrokerZoneRepository,
};

async function requireBrokerOwnerId(
  dependencies: Pick<BrokerPropertiesDependencies, "requireSession">,
) : Promise<string> {
  const session = assertBrokerSession(await dependencies.requireSession());
  const brokerId = session.context.brokerId;
  if (!brokerId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Broker profile required", status: 403 });
  }
  return brokerId;
}

async function requireOwnedBrokerProperty(
  propertyId: string,
  dependencies: BrokerPropertiesDependencies,
): Promise<PropertyDetail> {
  const brokerId = await requireBrokerOwnerId(dependencies);
  const property = await dependencies.repository.getProperty(propertyId);
  if (!property) {
    throw new DomainError({
      code: "NOT_FOUND",
      message: "Property not found",
      status: 404,
    });
  }
  if (property.brokerId !== brokerId) {
    throw new DomainError({
      code: "FORBIDDEN",
      message: "Cannot access this property",
      status: 403,
    });
  }
  return property;
}

/**
 * WHY:   Broker pages need a server-owned paginated property listing path.
 * WHAT:  Returns paginated broker properties for the current authenticated broker.
 * HOW:   Validates filters, resolves the broker owner id, and delegates listing to the repository.
 */
export async function listBrokerProperties(
  input: PropertyListFilters,
  dependencies: BrokerPropertiesDependencies = defaultDependencies,
): Promise<PaginatedPropertiesResult> {
  const parsed = propertyListFiltersSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid property list filters",
      status: 400,
    });
  }
  const brokerId = await requireBrokerOwnerId(dependencies);
  return dependencies.repository.listProperties(brokerId, parsed.data);
}

/**
 * WHY:   Broker pages need a server-owned property detail path with ownership enforcement.
 * WHAT:  Returns one broker-owned property by id.
 * HOW:   Loads the property from the repository and rejects when it is missing or not broker-owned.
 */
export async function getBrokerProperty(
  input: { id: string },
  dependencies: BrokerPropertiesDependencies = defaultDependencies,
): Promise<PropertyDetail> {
  return requireOwnedBrokerProperty(input.id, dependencies);
}

/**
 * WHY:   Broker property creation should run as a validated server function instead of a direct Convex mutation call.
 * WHAT:  Creates a new broker-owned property for the current session.
 * HOW:   Validates the payload, resolves the broker owner id, and calls the repository create primitive.
 */
export async function createBrokerProperty(
  input: CreatePropertyInput,
  dependencies: BrokerPropertiesDependencies = defaultDependencies,
): Promise<string> {
  const parsed = createPropertyInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid property payload",
      status: 400,
    });
  }
  const brokerId = await requireBrokerOwnerId(dependencies);
  return dependencies.repository.createProperty(brokerId, parsed.data);
}

/**
 * WHY:   Broker property updates must enforce ownership before mutating persisted data.
 * WHAT:  Updates a broker-owned property by id.
 * HOW:   Validates the patch, confirms ownership through the repository, then applies the update.
 */
export async function updateBrokerProperty(
  input: { id: string; patch: UpdatePropertyInput },
  dependencies: BrokerPropertiesDependencies = defaultDependencies,
): Promise<void> {
  const parsed = updatePropertyInputSchema.safeParse(input.patch);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid property patch",
      status: 400,
    });
  }
  await requireOwnedBrokerProperty(input.id, dependencies);
  await dependencies.repository.updateProperty(input.id, parsed.data);
}

/**
 * WHY:   Broker property deletion must enforce ownership before mutating persisted data.
 * WHAT:  Deletes a broker-owned property by id.
 * HOW:   Confirms ownership through the repository, then deletes the property.
 */
export async function deleteBrokerProperty(
  input: { id: string },
  dependencies: BrokerPropertiesDependencies = defaultDependencies,
): Promise<void> {
  await requireOwnedBrokerProperty(input.id, dependencies);
  await dependencies.repository.deleteProperty(input.id);
}

/**
 * WHY:   Broker property publication must enforce ownership before changing visibility state.
 * WHAT:  Publishes a broker-owned property by id.
 * HOW:   Confirms ownership through the repository, then delegates the publish mutation.
 */
export async function publishBrokerProperty(
  input: { id: string },
  dependencies: BrokerPropertiesDependencies = defaultDependencies,
): Promise<PublishPropertyResult> {
  await requireOwnedBrokerProperty(input.id, dependencies);
  return dependencies.repository.publishProperty(input.id);
}
