import { describe, expect, it } from "vitest";
import { legacyPublicationStateFromStage, legacyStatusFromStage, resolveStageForPublish } from "./shared";

describe("offer case shared helpers", () => {
  it("maps engaged and agreed stages to accepted legacy status", () => {
    expect(legacyStatusFromStage("engaged")).toBe("accepted");
    expect(legacyStatusFromStage("agreed")).toBe("accepted");
  });

  it("maps archived to archived publication state", () => {
    expect(legacyPublicationStateFromStage("archived")).toBe("archived");
  });

  it("publishes open offers into open stage and private cases into targeted", () => {
    expect(resolveStageForPublish("open_offer")).toBe("open");
    expect(resolveStageForPublish("private_offer")).toBe("targeted");
  });
});
