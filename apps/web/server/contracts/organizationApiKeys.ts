import { z } from "zod";

export const organizationApiKeyResourceSchema = z.enum(["clients", "properties"]);
export const organizationApiKeyActionSchema = z.enum(["read", "create", "update", "delete"]);

export const organizationApiKeyPermissionSchema = z.object({
  resource: organizationApiKeyResourceSchema,
  action: organizationApiKeyActionSchema,
});

export const createOrganizationApiKeyInputSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  permissions: z.array(organizationApiKeyPermissionSchema).min(1, "Select at least one permission"),
});

export type OrganizationApiKeyPermission = z.infer<typeof organizationApiKeyPermissionSchema>;
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
