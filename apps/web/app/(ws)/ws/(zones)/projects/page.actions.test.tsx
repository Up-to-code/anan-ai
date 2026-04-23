import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";
import type { ProjectMutationActionResult } from "./pages/ProjectsPage/actionTypes";

const {
  listProperties,
  requestProjectPublication,
  publishProperty,
  deleteProperty,
  getCapturedProps,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    listProperties: vi.fn(async () => ({
      page: [],
      isDone: true,
      continueCursor: "",
    })),
    requestProjectPublication: vi.fn(async () => ({ ok: true as const })),
    publishProperty: vi.fn(async () => ({ ok: true as const })),
    deleteProperty: vi.fn(async () => undefined),
    getCapturedProps: () => capturedProps,
    setCapturedProps: (props: unknown) => {
      capturedProps = props;
    },
  };
});

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "broker",
    ownerContext: { ownerType: "broker", ownerId: "broker-1" },
  })),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspacePropertyZone: vi.fn(() => ({
    listProperties,
    publishProperty,
    deleteProperty,
  })),
  getWorkspaceProjectZone: vi.fn(() => ({
    requestProjectPublication,
  })),
}));

vi.mock("./pages/ProjectsPage", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>ProjectsPageMock</div>;
  },
}));

import WorkspaceProjectsRoute from "./page";

type CapturedProps = {
  onPublishProject: (projectId: string) => Promise<ProjectMutationActionResult>;
  onDeleteProject: (projectId: string) => Promise<ProjectMutationActionResult>;
};

beforeEach(() => {
  listProperties.mockClear();
  requestProjectPublication.mockClear();
  publishProperty.mockClear();
  deleteProperty.mockClear();
  requestProjectPublication.mockResolvedValue({ ok: true });
  publishProperty.mockResolvedValue({ ok: true });
  deleteProperty.mockResolvedValue(undefined);
  setCapturedProps(null);
});

it("returns a stable domain result when publishing is blocked by verification", async () => {
  requestProjectPublication.mockRejectedValue(
    new DomainError({
      code: "VERIFICATION_REQUIRED",
      message: "Organization verification is required before publishing",
      status: 403,
    }),
  );

  const element = await WorkspaceProjectsRoute();
  const markup = renderToStaticMarkup(element);
  const props = getCapturedProps() as CapturedProps;
  const result = await props.onPublishProject("property-1");

  expect(markup).toContain("ProjectsPageMock");
  expect(result).toEqual({
    ok: false,
    code: "VERIFICATION_REQUIRED",
    message: "Organization verification is required before publishing",
  });
});

it("returns success envelopes for completed mutations", async () => {
  const element = await WorkspaceProjectsRoute();
  renderToStaticMarkup(element);
  const props = getCapturedProps() as CapturedProps;

  await expect(props.onPublishProject("property-1")).resolves.toEqual({ ok: true });
  await expect(props.onDeleteProject("property-1")).resolves.toEqual({ ok: true });
});
