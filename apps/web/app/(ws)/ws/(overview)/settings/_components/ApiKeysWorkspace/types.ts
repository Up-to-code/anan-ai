import type {
  OrganizationApiKeySecretResult,
  OrganizationApiKeySummary,
} from "@/server/contracts/organizationApiKeys";
import type { CreateOrganizationApiKeyInput } from "@/server/contracts/organizationApiKeys";

export type ApiKeysWorkspaceProps = {
  initialKeys: OrganizationApiKeySummary[];
  canCreate: boolean;
  canRevoke: boolean;
  canView: boolean;
  hasOrganization: boolean;
  onCreateKey: (
    input: CreateOrganizationApiKeyInput,
  ) => Promise<{ ok: true; message: string; result: OrganizationApiKeySecretResult } | { ok: false; message: string }>;
  onRevokeKey: (keyId: string) => Promise<{ ok: true; message: string } | { ok: false; message: string }>;
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
