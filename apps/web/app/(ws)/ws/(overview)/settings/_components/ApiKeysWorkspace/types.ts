import type {
  OrganizationApiKeySecretResult,
  OrganizationApiKeySummary,
} from "@/server/contracts/organizationApiKeys";

export type ApiKeysWorkspaceProps = {
  initialKeys: OrganizationApiKeySummary[];
  canCreate: boolean;
  canRevoke: boolean;
  canView: boolean;
  hasOrganization: boolean;
};

export type ApiKeysWorkspaceState = {
  isModalOpen: boolean;
  keys: OrganizationApiKeySummary[];
  name: string;
  selectedPermissionKeys: string[];
  status: string | null;
  revealedResult: OrganizationApiKeySecretResult | null;
  isSubmitting: boolean;
  isRevoking: string | null;
  copied: boolean;
};
