import type { DocsPageDefinition } from "../types";
import { OAUTH_SCOPES } from "../scopes";

export const scopesAndOrgPermissionsPage: DocsPageDefinition = {
    key: "scopes-and-org-permissions",
    href: "/docs/scopes-and-org-permissions",
    title: "Scopes and Organization Permissions",
    description: "How scopes and ownership context affect delegated API access.",
    summary:
      "Access decisions are scope-driven and ownership-aware. Delegated resource handlers resolve caller context from token and user profile, including broker/RED links for organization-scoped resources.",
    sections: [
      {
        id: "scope-basics",
        title: "Scope Basics",
        paragraphs: [
          "Request the minimum scope set for each feature. Some endpoints accept either broad read scopes or own-resource read scopes.",
          "Examples: clients list accepts `clients:read_own` or `clients:read`; properties list accepts `properties:read_own` or `properties:read`.",
        ],
      },
      {
        id: "ownership-context",
        title: "Organization Ownership Context",
        bullets: [
          "Delegated handlers resolve token context and user profile before resource access.",
          "For property access, ownership links (`brokerId`, `REDId`) are used to scope delegated resources.",
          "For client access, owner auth user id is used to list user-owned clients.",
        ],
      },
      {
        id: "recommended-scope-profiles",
        title: "Recommended Scope Profiles",
        bullets: [
          "Read-only CRM sync: `openid profile clients:read_own properties:read_own`",
          "Client creation workflow: `openid profile clients:read_own clients:create`",
          "Property publishing assistant: `openid profile properties:read_own properties:create_own properties:update_own`",
        ],
      },
      {
        id: "scope-reference",
        title: "Scope Reference",
        scopes: OAUTH_SCOPES,
      },
    ],
};
