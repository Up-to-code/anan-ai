import { createHash, randomBytes } from "crypto";
import { requireSessionContext, type ResolvedSession } from "@/server/auth/session";
import {
  createOrganizationApiKeyInputSchema,
  normalizeOrganizationApiKeyPermissions,
  type CreateOrganizationApiKeyInput,
  type OrganizationApiKeySecretResult,
  type OrganizationApiKeySummary,
} from "@/server/contracts/organizationApiKeys";
import {
  orgApiClientInputSchema,
  orgApiClientUpdateInputSchema,
  orgApiDealInputSchema,
  orgApiDealUpdateInputSchema,
  orgApiPropertyInputSchema,
  orgApiPropertyUpdateInputSchema,
  type OrgApiBrokerRecord,
  type OrgApiClientInput,
  type OrgApiClientRecord,
  type OrgApiClientUpdateInput,
  type OrgApiDealInput,
  type OrgApiDealRecord,
  type OrgApiDealUpdateInput,
  type OrgApiPropertyInput,
  type OrgApiPropertyRecord,
  type OrgApiPropertyUpdateInput,
} from "@/server/contracts/orgApi";
import { DomainError, normalizeDomainError } from "@/server/contracts/errors";
import {
  convexOrganizationApiKeysRepository,
  type OrganizationApiKeysRepository,
} from "@/server/infrastructure/convex/organizations/apiKeys";

type OrganizationApiKeysServiceDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  repository: OrganizationApiKeysRepository;
};

const defaultDependencies: OrganizationApiKeysServiceDependencies = {
  requireSession: requireSessionContext,
  repository: convexOrganizationApiKeysRepository,
};

function hashOrganizationApiKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function buildApiKeyMaterial() {
  const keyId = `oak_${randomBytes(8).toString("hex")}`;
  const prefix = `anan_${randomBytes(4).toString("hex")}`;
  const apiKey = `${prefix}.${randomBytes(24).toString("base64url")}`;
  return {
    keyId,
    prefix,
    apiKey,
    secretHash: hashOrganizationApiKey(apiKey),
  };
}

function buildDefaultOrganizationApiKeyName(timestamp: number) {
  const formatted = new Date(timestamp).toISOString().slice(0, 16).replace("T", " ");
  return `API Key ${formatted}`;
}

function parseOrganizationApiKeyInput(input: unknown): CreateOrganizationApiKeyInput {
  const parsed = createOrganizationApiKeyInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid API key payload",
      status: 400,
    });
  }
  return {
    name: parsed.data.name || buildDefaultOrganizationApiKeyName(now()),
    permissions: normalizeOrganizationApiKeyPermissions(parsed.data.permissions),
  };
}

function requireApiKeyValue(rawKey: string | null | undefined) {
  const apiKey = rawKey?.trim();
  if (!apiKey) {
    throw new DomainError({
      code: "UNAUTHORIZED",
      message: "X-Anan-Api-Key header is required",
      status: 401,
    });
  }
  return apiKey;
}

function parseClientInput(input: unknown): OrgApiClientInput {
  const parsed = orgApiClientInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid client payload",
      status: 400,
    });
  }
  return parsed.data;
}

function parseClientUpdateInput(input: unknown): OrgApiClientUpdateInput {
  const parsed = orgApiClientUpdateInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid client payload",
      status: 400,
    });
  }
  return parsed.data;
}

function parsePropertyInput(input: unknown): OrgApiPropertyInput {
  const parsed = orgApiPropertyInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid property payload",
      status: 400,
    });
  }
  return parsed.data;
}

function parsePropertyUpdateInput(input: unknown): OrgApiPropertyUpdateInput {
  const parsed = orgApiPropertyUpdateInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid property payload",
      status: 400,
    });
  }
  return parsed.data;
}

function parseDealInput(input: unknown): OrgApiDealInput {
  const parsed = orgApiDealInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid deal payload",
      status: 400,
    });
  }
  return parsed.data;
}

function parseDealUpdateInput(input: unknown): OrgApiDealUpdateInput {
  const parsed = orgApiDealUpdateInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid deal payload",
      status: 400,
    });
  }
  return parsed.data;
}

function now() {
  return Date.now();
}

async function runWithKey<T>(
  rawApiKey: string | null | undefined,
  operation: (secretHash: string, issuedAt: number, origin?: string) => Promise<T>,
  origin?: string,
): Promise<T> {
  try {
    const secretHash = hashOrganizationApiKey(requireApiKeyValue(rawApiKey));
    const issuedAt = now();
    if (origin === undefined) {
      return await operation(secretHash, issuedAt);
    }
    return await operation(secretHash, issuedAt, origin);
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

export async function listCurrentOrganizationApiKeysForCurrentUser(
  dependencies: OrganizationApiKeysServiceDependencies = defaultDependencies,
): Promise<OrganizationApiKeySummary[]> {
  const session = await dependencies.requireSession();
  try {
    return await dependencies.repository.listCurrentOrganizationApiKeys(session.token);
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

export async function createCurrentOrganizationApiKeyForCurrentUser(
  input: unknown,
  dependencies: OrganizationApiKeysServiceDependencies = defaultDependencies,
): Promise<OrganizationApiKeySecretResult> {
  const parsedInput = parseOrganizationApiKeyInput(input);
  const session = await dependencies.requireSession();
  const { apiKey, ...persistedMaterial } = buildApiKeyMaterial();
  try {
    const key = await dependencies.repository.createCurrentOrganizationApiKey(session.token, {
      ...parsedInput,
      ...persistedMaterial,
      now: now(),
    });
    return {
      key,
      apiKey,
    };
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

export async function revokeCurrentOrganizationApiKeyForCurrentUser(
  keyId: string,
  dependencies: OrganizationApiKeysServiceDependencies = defaultDependencies,
): Promise<void> {
  const session = await dependencies.requireSession();
  try {
    await dependencies.repository.revokeCurrentOrganizationApiKey(session.token, keyId, now());
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

export async function listOrganizationClientsByApiKey(
  rawApiKey: string | null | undefined,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiClientRecord[]> {
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.listClientsByApiKey(secretHash, issuedAt, callerOrigin), origin);
}

export async function createOrganizationClientByApiKey(
  rawApiKey: string | null | undefined,
  input: unknown,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiClientRecord> {
  const parsedInput = parseClientInput(input);
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.createClientByApiKey(secretHash, parsedInput, issuedAt, callerOrigin), origin);
}

export async function updateOrganizationClientByApiKey(
  rawApiKey: string | null | undefined,
  clientId: string,
  input: unknown,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiClientRecord> {
  const parsedInput = parseClientUpdateInput(input);
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.updateClientByApiKey(secretHash, clientId, parsedInput, issuedAt, callerOrigin), origin);
}

export async function deleteOrganizationClientByApiKey(
  rawApiKey: string | null | undefined,
  clientId: string,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<void> {
  await runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.deleteClientByApiKey(secretHash, clientId, issuedAt, callerOrigin), origin);
}

export async function listOrganizationPropertiesByApiKey(
  rawApiKey: string | null | undefined,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiPropertyRecord[]> {
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.listPropertiesByApiKey(secretHash, issuedAt, callerOrigin), origin);
}

export async function createOrganizationPropertyByApiKey(
  rawApiKey: string | null | undefined,
  input: unknown,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiPropertyRecord> {
  const parsedInput = parsePropertyInput(input);
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.createPropertyByApiKey(secretHash, parsedInput, issuedAt, callerOrigin), origin);
}

export async function updateOrganizationPropertyByApiKey(
  rawApiKey: string | null | undefined,
  propertyId: string,
  input: unknown,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiPropertyRecord> {
  const parsedInput = parsePropertyUpdateInput(input);
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.updatePropertyByApiKey(secretHash, propertyId, parsedInput, issuedAt, callerOrigin), origin);
}

export async function deleteOrganizationPropertyByApiKey(
  rawApiKey: string | null | undefined,
  propertyId: string,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<void> {
  await runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.deletePropertyByApiKey(secretHash, propertyId, issuedAt, callerOrigin), origin);
}

export async function listOrganizationDealsByApiKey(
  rawApiKey: string | null | undefined,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiDealRecord[]> {
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.listDealsByApiKey(secretHash, issuedAt, callerOrigin), origin);
}

export async function createOrganizationDealByApiKey(
  rawApiKey: string | null | undefined,
  input: unknown,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiDealRecord> {
  const parsedInput = parseDealInput(input);
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.createDealByApiKey(secretHash, parsedInput, issuedAt, callerOrigin), origin);
}

export async function updateOrganizationDealByApiKey(
  rawApiKey: string | null | undefined,
  dealId: string,
  input: unknown,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiDealRecord> {
  const parsedInput = parseDealUpdateInput(input);
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.updateDealByApiKey(secretHash, dealId, parsedInput, issuedAt, callerOrigin), origin);
}

export async function deleteOrganizationDealByApiKey(
  rawApiKey: string | null | undefined,
  dealId: string,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<void> {
  await runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.deleteDealByApiKey(secretHash, dealId, issuedAt, callerOrigin), origin);
}

export async function listOrganizationBrokersByApiKey(
  rawApiKey: string | null | undefined,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiBrokerRecord[]> {
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.listBrokersByApiKey(secretHash, issuedAt, callerOrigin), origin);
}

export async function getOrganizationBrokerByApiKey(
  rawApiKey: string | null | undefined,
  brokerId: string,
  origin?: string,
  dependencies: Pick<OrganizationApiKeysServiceDependencies, "repository"> = defaultDependencies,
): Promise<OrgApiBrokerRecord> {
  return runWithKey(rawApiKey, (secretHash, issuedAt, callerOrigin) => dependencies.repository.getBrokerByApiKey(secretHash, brokerId, issuedAt, callerOrigin), origin);
}
