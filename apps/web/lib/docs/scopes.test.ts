import { expect, it } from "vitest";
import { OAUTH_SCOPES } from "./scopes";
import { OAUTH_SCOPE_LABELS, OAUTH_SCOPE_REGISTRY } from "../../../../convex/_core/oauth/constants";

it("keeps the docs scope list aligned with the shared oauth scope registry", () => {
  expect(OAUTH_SCOPES.map((scope) => scope.id)).toEqual(OAUTH_SCOPE_REGISTRY);

  OAUTH_SCOPES.forEach((scope) => {
    expect(OAUTH_SCOPE_LABELS[scope.id]).toBe(scope.label);
  });
});
