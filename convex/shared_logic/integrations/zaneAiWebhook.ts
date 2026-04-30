import { v } from "convex/values";

import { internal } from "../../_generated/api";
import { action, internalMutation, internalQuery } from "../../_generated/server";
import type { GenericId } from "convex/values";
import type { MutationCtx } from "../../_generated/server";
import {
  buildOwnerContext,
  findTenantOrgLinkByOwner,
  getOrganizationRecord,
  type OwnerContext,
} from "../agencies/repositories/core";
import { getProjectDossierByPropertyId } from "../projects/readiness";

const VERSION = "org.sync.v1";
const DESTINATION = "zaneai";
const SOURCE_SYSTEM = "anan";
const MAX_ATTEMPTS = 8;

export type ZaneAiWebhookAction =
  | "organization.upsert"
  | "organization.archive"
  | "project.upsert"
  | "project.archive"
  | "unit.upsert"
  | "unit.archive";

type ActorContext = {
  authUserId?: string;
  role?: string;
};

type OwnerAccess = ActorContext & {
  brokerId?: GenericId<"brokers">;
  REDId?: GenericId<"RED">;
};
type BoundedMetadataValue =
  | string
  | number
  | boolean
  | null
  | (string | number | boolean | null)[]
  | Record<string, string | number | boolean | null>;
type BoundedMetadata = Record<string, BoundedMetadataValue>;

function buildEventId(action: ZaneAiWebhookAction) {
  return `zaneai_${action.replace(".", "_")}_${crypto.randomUUID()}`;
}

function ownerFromAccess(access: OwnerAccess): OwnerContext {
  if (access.brokerId) {
    return buildOwnerContext({
      ownerType: "broker",
      ownerBrokerId: access.brokerId,
      authUserId: access.authUserId,
    });
  }
  if (access.REDId) {
    return buildOwnerContext({
      ownerType: "RED",
      ownerREDId: access.REDId,
      authUserId: access.authUserId,
    });
  }
  throw new Error("Organization owner is required for ZaneAI webhook sync");
}

function pickString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function toWebhookMetadata(value: unknown): BoundedMetadata | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const metadata: BoundedMetadata = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (
      entry === null ||
      typeof entry === "string" ||
      typeof entry === "number" ||
      typeof entry === "boolean"
    ) {
      metadata[key] = entry;
      continue;
    }
    if (Array.isArray(entry) && entry.every((item) => (
      item === null ||
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    ))) {
      metadata[key] = entry;
      continue;
    }
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      const nested: Record<string, string | number | boolean | null> = {};
      for (const [nestedKey, nestedValue] of Object.entries(entry as Record<string, unknown>)) {
        if (
          nestedValue === null ||
          typeof nestedValue === "string" ||
          typeof nestedValue === "number" ||
          typeof nestedValue === "boolean"
        ) {
          nested[nestedKey] = nestedValue;
        }
      }
      metadata[key] = nested;
    }
  }
  return metadata;
}

async function buildOrganizationSnapshot(ctx: MutationCtx, owner: OwnerContext) {
  const [organization, tenantLink] = await Promise.all([
    getOrganizationRecord(ctx, owner) as Promise<any>,
    findTenantOrgLinkByOwner(ctx, owner),
  ]);
  const externalOrgId = owner.ownerType === "broker" ? String(owner.ownerBrokerId) : String(owner.ownerREDId);
  const name = organization?.name ?? "Organization";
  return {
    id: externalOrgId,
    externalOrgId,
    externalTenantOrgId: tenantLink?.tenantOrgId,
    tenantOrgId: tenantLink?.tenantOrgId,
    name,
    slug: organization?.slug,
    type: owner.ownerType === "broker" ? "broker" : "red",
    status: organization?.status ?? "active",
    description: organization?.description,
    website: organization?.website,
    contactEmail: organization?.contactEmail,
    phone: organization?.phone,
    isVerified: organization?.isVerified,
    countryCode: organization?.countryCode,
  };
}

async function buildProjectSnapshot(ctx: MutationCtx, propertyId: GenericId<"properties">) {
  const property = (await ctx.db.get(propertyId)) as any;
  if (!property) {
    throw new Error("Property not found for ZaneAI project sync");
  }
  const dossier = (await getProjectDossierByPropertyId(ctx, propertyId)) as any;
  const externalProjectId = String(dossier?._id ?? propertyId);
  return {
    id: externalProjectId,
    externalProjectId,
    sourcePropertyId: String(propertyId),
    title: dossier?.title ?? property.title,
    name: dossier?.title ?? property.title,
    slug: property.slug,
    projectType: dossier?.projectType,
    type: dossier?.projectType,
    location:
      [dossier?.location?.city, dossier?.location?.district, dossier?.location?.neighborhood]
        .filter(Boolean)
        .join(", ") || property.location || property.address,
    address: property.address,
    description: dossier?.summary ?? property.description,
    summary: dossier?.summary ?? property.description,
    shortDescription: dossier?.summary,
    priceLabel:
      typeof property.price === "number"
        ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(property.price)
        : pickString(property.priceLabel),
    startingPrice:
      typeof property.price === "number"
        ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(property.price)
        : pickString(property.priceLabel),
    expectedUnits: dossier?.expectedUnitCountLabel ? Number(dossier.expectedUnitCountLabel) : undefined,
    status: property.publicationState === "archived" ? "archived" : property.publicationState === "published" ? "published" : "draft",
    publicationState: property.publicationState ?? "draft",
    listingType: property.listingType,
    compoundName: property.compoundName,
    currency: property.currency,
  };
}

function buildUnitSnapshot(unit: any) {
  return {
    id: String(unit._id),
    externalUnitId: String(unit._id),
    label: unit.label,
    name: unit.label,
    unitType: unit.unitType ?? unit.unitKind ?? "apartment",
    type: unit.unitType ?? unit.unitKind,
    status: unit.status ?? "available",
    availability: unit.status ?? "available",
    publicationState: unit.status === "draft" ? "draft" : "published",
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    area: typeof unit.sizeSqm === "number" ? `${unit.sizeSqm}` : undefined,
    areaSqm: unit.sizeSqm,
    floor: unit.floor,
    price: unit.price,
    priceLabel:
      typeof unit.price === "number"
        ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(unit.price)
        : undefined,
    deliveryDate: unit.handoverAt ? new Date(unit.handoverAt).toISOString() : undefined,
    direction: unit.view,
  };
}

async function enqueueZaneAiEvent(ctx: MutationCtx, args: {
  action: ZaneAiWebhookAction;
  tenantOrgId?: string;
  externalOrgId?: string;
  externalProjectId?: string;
  externalUnitId?: string;
  actor?: ActorContext;
  organization?: unknown;
  project?: unknown;
  unit?: unknown;
}) {
  const now = Date.now();
  const payload = {
    version: VERSION,
    action: args.action,
    occurredAt: now,
    source: {
      system: "anan" as const,
      environment: process.env.CONVEX_CLOUD_URL ?? process.env.SITE_URL ?? "unknown",
      tenantOrgId: args.tenantOrgId,
    },
    actor: toWebhookMetadata(args.actor),
    organization: toWebhookMetadata(args.organization),
    project: toWebhookMetadata(args.project),
    unit: toWebhookMetadata(args.unit),
  };
  await ctx.db.insert("zaneAiWebhookOutbox", {
    eventId: buildEventId(args.action),
    version: VERSION,
    action: args.action,
    destination: DESTINATION,
    sourceSystem: SOURCE_SYSTEM,
    tenantOrgId: args.tenantOrgId,
    externalOrgId: args.externalOrgId,
    externalProjectId: args.externalProjectId,
    externalUnitId: args.externalUnitId,
    payload,
    status: "pending",
    attempts: 0,
    nextAttemptAt: now,
    createdAt: now,
    updatedAt: now,
  });
}

export async function enqueueOrganizationUpsertForZaneAi(ctx: MutationCtx, owner: OwnerContext, actor?: ActorContext) {
  const organization = await buildOrganizationSnapshot(ctx, owner);
  await enqueueZaneAiEvent(ctx, {
    action: "organization.upsert",
    tenantOrgId: organization.tenantOrgId,
    externalOrgId: organization.externalOrgId,
    actor,
    organization,
  });
}

export async function enqueueProjectUpsertForZaneAi(
  ctx: MutationCtx,
  propertyId: GenericId<"properties">,
  access: OwnerAccess,
) {
  const owner = ownerFromAccess(access);
  const organization = await buildOrganizationSnapshot(ctx, owner);
  const project = await buildProjectSnapshot(ctx, propertyId);
  await enqueueZaneAiEvent(ctx, {
    action: "project.upsert",
    tenantOrgId: organization.tenantOrgId,
    externalOrgId: organization.externalOrgId,
    externalProjectId: project.externalProjectId,
    actor: access,
    organization,
    project,
  });
}

export async function enqueueProjectArchiveForZaneAi(
  ctx: MutationCtx,
  propertyId: GenericId<"properties">,
  access: OwnerAccess,
) {
  const owner = ownerFromAccess(access);
  const organization = await buildOrganizationSnapshot(ctx, owner);
  const project = await buildProjectSnapshot(ctx, propertyId);
  await enqueueZaneAiEvent(ctx, {
    action: "project.archive",
    tenantOrgId: organization.tenantOrgId,
    externalOrgId: organization.externalOrgId,
    externalProjectId: project.externalProjectId,
    actor: access,
    organization,
    project,
  });
}

export async function enqueueProjectUnitsForZaneAi(
  ctx: MutationCtx,
  propertyId: GenericId<"properties">,
  access: OwnerAccess,
) {
  const owner = ownerFromAccess(access);
  const organization = await buildOrganizationSnapshot(ctx, owner);
  const project = await buildProjectSnapshot(ctx, propertyId);
  const units = await ctx.db
    .query("projectUnits")
    .withIndex("propertyId", (q: any) => q.eq("propertyId", propertyId))
    .collect();

  for (const unit of units) {
    const unitSnapshot = buildUnitSnapshot(unit);
    await enqueueZaneAiEvent(ctx, {
      action: "unit.upsert",
      tenantOrgId: organization.tenantOrgId,
      externalOrgId: organization.externalOrgId,
      externalProjectId: project.externalProjectId,
      externalUnitId: unitSnapshot.externalUnitId,
      actor: access,
      organization,
      project,
      unit: unitSnapshot,
    });
  }
}

export async function enqueueProjectUnitArchiveForZaneAi(
  ctx: MutationCtx,
  propertyId: GenericId<"properties">,
  unit: any,
  access: OwnerAccess,
) {
  const owner = ownerFromAccess(access);
  const organization = await buildOrganizationSnapshot(ctx, owner);
  const project = await buildProjectSnapshot(ctx, propertyId);
  const unitSnapshot = buildUnitSnapshot(unit);
  await enqueueZaneAiEvent(ctx, {
    action: "unit.archive",
    tenantOrgId: organization.tenantOrgId,
    externalOrgId: organization.externalOrgId,
    externalProjectId: project.externalProjectId,
    externalUnitId: unitSnapshot.externalUnitId,
    actor: access,
    organization,
    project,
    unit: unitSnapshot,
  });
}

export const listDueZaneAiWebhookEvents = internalQuery({
  args: { now: v.number(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("zaneAiWebhookOutbox")
      .withIndex("status_nextAttemptAt", (q) => q.eq("status", "pending").lte("nextAttemptAt", args.now))
      .take(args.limit ?? 20);
  },
});

export const markZaneAiWebhookDelivering = internalMutation({
  args: { id: v.id("zaneAiWebhookOutbox"), now: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "delivering",
      lastAttemptAt: args.now,
      attempts: ((await ctx.db.get(args.id))?.attempts ?? 0) + 1,
      updatedAt: args.now,
    });
  },
});

export const markZaneAiWebhookDelivered = internalMutation({
  args: { id: v.id("zaneAiWebhookOutbox"), now: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "delivered", deliveredAt: args.now, updatedAt: args.now });
  },
});

export const markZaneAiWebhookFailed = internalMutation({
  args: { id: v.id("zaneAiWebhookOutbox"), now: v.number(), error: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    const attempts = row?.attempts ?? 0;
    await ctx.db.patch(args.id, {
      status: attempts >= MAX_ATTEMPTS ? "dead" : "pending",
      nextAttemptAt: args.now + Math.min(60 * 60 * 1000, 2 ** attempts * 30 * 1000),
      lastError: args.error.slice(0, 1000),
      updatedAt: args.now,
    });
  },
});

async function hmacSha256Hex(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const deliverDueZaneAiWebhooks = action({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ scanned: number; delivered: number; failed: number }> => {
    const endpoint = process.env.ZANEAI_ANAN_WEBHOOK_URL;
    const secret = process.env.ANAN_ZANEAI_WEBHOOK_SECRET;
    if (!endpoint || !secret) {
      throw new Error("ZANEAI_ANAN_WEBHOOK_URL and ANAN_ZANEAI_WEBHOOK_SECRET are required");
    }
    const now = Date.now();
    const rows: any[] = await ctx.runQuery(internal.shared_logic.integrations.zaneAiWebhook.listDueZaneAiWebhookEvents as any, {
      now,
      limit: args.limit,
    });
    let delivered = 0;
    let failed = 0;
    for (const row of rows) {
      await ctx.runMutation(internal.shared_logic.integrations.zaneAiWebhook.markZaneAiWebhookDelivering, {
        id: row._id,
        now: Date.now(),
      });
      const body = JSON.stringify(row.payload);
      const timestamp = String(Date.now());
      const signature = await hmacSha256Hex(secret, `${row.eventId}.${timestamp}.${body}`);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-ZaneAI-Event-Id": row.eventId,
            "X-ZaneAI-Timestamp": timestamp,
            "X-ZaneAI-Signature": `v1=${signature}`,
            "X-ZaneAI-Source-Environment": process.env.CONVEX_CLOUD_URL ?? "anan",
          },
          body,
        });
        if (!response.ok) {
          throw new Error(`ZaneAI webhook returned ${response.status}: ${(await response.text()).slice(0, 500)}`);
        }
        await ctx.runMutation(internal.shared_logic.integrations.zaneAiWebhook.markZaneAiWebhookDelivered, {
          id: row._id,
          now: Date.now(),
        });
        delivered += 1;
      } catch (error) {
        await ctx.runMutation(internal.shared_logic.integrations.zaneAiWebhook.markZaneAiWebhookFailed, {
          id: row._id,
          now: Date.now(),
          error: error instanceof Error ? error.message : String(error),
        });
        failed += 1;
      }
    }
    return { scanned: rows.length, delivered, failed };
  },
});
