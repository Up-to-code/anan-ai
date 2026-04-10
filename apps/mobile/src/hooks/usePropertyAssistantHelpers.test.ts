import { describe, expect, it } from "vitest";
import {
  buildAssistantSelectionPayload,
  readSelectedPropertiesFromAssistantMessage,
  resolveSelectedPropertiesFromAssistantResponse,
} from "@/hooks/usePropertyAssistantHelpers";
import type { MobileProperty } from "@/types/mobile";

function createProperty(id: string, title = `Property ${id}`): MobileProperty {
  return {
    id,
    title,
    address: `${title} address`,
    price: 1_000_000,
    beds: 3,
    baths: 3,
    media: ["https://example.com/1.jpg"],
    owner: {
      id: `owner-${id}`,
      type: "broker",
      name: `Owner ${id}`,
      slug: `owner-${id}`,
      isVerified: true,
    },
  };
}

describe("usePropertyAssistantHelpers", () => {
  it("sends selectedPropertyIds for comparison sets while preserving the primary property id", () => {
    const payload = buildAssistantSelectionPayload([
      createProperty("p-1"),
      createProperty("p-2"),
      createProperty("p-3"),
    ]);

    expect(payload).toEqual({
      selectedPropertyId: "p-1",
      selectedPropertyIds: ["p-1", "p-2", "p-3"],
    });
  });

  it("keeps single-property requests backward compatible", () => {
    const payload = buildAssistantSelectionPayload([createProperty("p-1")]);

    expect(payload).toEqual({
      selectedPropertyId: "p-1",
      selectedPropertyIds: undefined,
    });
  });

  it("does not restore a multi-property rail from comparison metadata alone", () => {
    const first = createProperty("p-1", "Palm");
    const second = createProperty("p-2", "Dunes");

    const restored = readSelectedPropertiesFromAssistantMessage({
      properties: [first, second],
      comparisonPropertyIds: ["p-2", "p-1"],
      activePropertyId: "p-1",
    });

    expect(restored).toEqual([]);
  });

  it("clears comparison selection from fresh assistant responses once the turn is sent", () => {
    const first = createProperty("p-1", "Palm");
    const second = createProperty("p-2", "Dunes");

    const resolved = resolveSelectedPropertiesFromAssistantResponse({
      response: {
        properties: [first, second],
        comparisonPropertyIds: ["p-2", "p-1"],
        activePropertyId: "p-1",
      },
      currentSelection: [first, second],
      activeProperty: first,
    });

    expect(resolved).toEqual([]);
  });
});
