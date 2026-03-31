import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { updateCurrentProfileForCurrentUser } = vi.hoisted(() => ({
  updateCurrentProfileForCurrentUser: vi.fn(),
}));

vi.mock("@/server/domains/auth/profiles/service", () => ({
  updateCurrentProfileForCurrentUser,
}));

import { saveProfileAction } from "./actions";

beforeEach(() => {
  updateCurrentProfileForCurrentUser.mockReset();
});

it("returns a success message after saving the profile", async () => {
  updateCurrentProfileForCurrentUser.mockResolvedValue({
    name: "Ahmed",
  });

  await expect(
    saveProfileAction({ name: "Ahmed", username: "ahmed", showInOffersDirectory: true }),
  ).resolves.toEqual({
    ok: true,
    message: "تم حفظ التعديلات بنجاح.",
  });
});

it("normalizes profile save failures", async () => {
  updateCurrentProfileForCurrentUser.mockRejectedValue(
    new DomainError({
      code: "FORBIDDEN",
      message: "Profile update not allowed",
      status: 403,
    }),
  );

  await expect(
    saveProfileAction({ name: "Ahmed", username: "ahmed", showInOffersDirectory: true }),
  ).resolves.toEqual({
    ok: false,
    message: "Profile update not allowed",
  });
});
