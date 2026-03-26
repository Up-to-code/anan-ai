import { z } from "zod";
import {
  ORGANIZATION_API_KEY_ACTIONS,
  ORGANIZATION_API_KEY_RESOURCES,
  type OrganizationApiKeyAction,
  type OrganizationApiKeyResource,
} from "@/lib/auth/organizationPermissions";

export const organizationApiKeyResourceSchema = z.enum(ORGANIZATION_API_KEY_RESOURCES);
export const organizationApiKeyActionSchema = z.enum(ORGANIZATION_API_KEY_ACTIONS);

export const organizationApiKeyPermissionSchema = z.object({
  resource: organizationApiKeyResourceSchema,
  action: organizationApiKeyActionSchema,
});

export const createOrganizationApiKeyInputSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  permissions: z.array(organizationApiKeyPermissionSchema).min(1, "Select at least one permission"),
});

export type OrganizationApiKeyPermission = {
  resource: OrganizationApiKeyResource;
  action: OrganizationApiKeyAction;
};
export type CreateOrganizationApiKeyInput = z.infer<typeof createOrganizationApiKeyInputSchema>;

export type OrganizationApiKeySummary = {
  id: string;
  keyId: string;
  prefix: string;
  name: string;
  permissions: OrganizationApiKeyPermission[];
  status: "active" | "revoked";
  createdBy: string;
  createdByName?: string;
  createdAt: number;
  revokedAt?: number;
  lastUsedAt?: number;
};

export type OrganizationApiKeySecretResult = {
  key: OrganizationApiKeySummary;
  apiKey: string;
};

export function normalizeOrganizationApiKeyPermissions(
  permissions: readonly OrganizationApiKeyPermission[],
): OrganizationApiKeyPermission[] {
  return [...new Map(
    permissions
      .map((permission) => ({
        resource: permission.resource,
        action: permission.action,
      }))
      .sort((left, right) => {
        if (left.resource === right.resource) {
          return left.action.localeCompare(right.action);
        }
        return left.resource.localeCompare(right.resource);
      })
      .map((permission) => [`${permission.resource}:${permission.action}`, permission]),
  ).values()];
}
