import { expect, it } from "vitest";
import {
  mapUnitCreateToPropertyInput,
  mapUnitCreateToUnitInputs,
  validateUnitCreateSubmission,
  type UnitCreateFormData,
} from "./unitFormSubmission";

const validUnit: UnitCreateFormData = {
  name: "Unit A-101",
  location: "Riyadh, Al Malqa",
  unitType: "apartment",
  listingType: "sale",
  price: "1,250,000",
  area: "145",
  rooms: "3",
  baths: "2",
  floor: "5",
  view: "Garden",
  status: "available",
  description: "Ready unit with clear sales value.",
  adLicenseNumber: "AD-UNIT-1",
  paymentPlanTitle: "Primary plan",
  downPayment: "150,000",
  handoverAt: "2026-12-31",
  parkingSpaces: "1",
  priceComparison: "fair_market",
  comparisonNotes: "Aligned with nearby ready units.",
  expertNotes: "Good fit for investor leads.",
  services: ["Parking", "Security"],
  images: [],
  privatePermitFiles: [],
};

it("validates required standalone unit fields while allowing expert comparison fields", () => {
  expect(validateUnitCreateSubmission(validUnit)).toBeNull();

  const feedback = validateUnitCreateSubmission({ ...validUnit, name: "", area: "" });

  expect(feedback?.fieldErrors).toEqual(expect.objectContaining({
    name: "اسم الوحدة مطلوب.",
    area: "المساحة مطلوبة.",
  }));
});

it("persists unit expert metadata while preserving canonical property and unit fields", () => {
  const propertyInput = mapUnitCreateToPropertyInput(validUnit);
  const unitInput = mapUnitCreateToUnitInputs(validUnit)[0];

  expect(propertyInput).toEqual(expect.objectContaining({
    title: "Unit A-101",
    price: 1250000,
    beds: 3,
    baths: 2,
    sqft: 145,
    body: {
      presentation: expect.objectContaining({
        amenities: ["Parking", "Security"],
        parkingSpaces: 1,
        expertMetadata: expect.objectContaining({
          assetType: "apartment",
          listingType: "sale",
          priceComparison: "fair_market",
          comparisonNotes: "Aligned with nearby ready units.",
          services: ["Parking", "Security"],
        }),
      }),
    },
  }));

  expect(unitInput).toEqual(expect.objectContaining({
    label: "Unit A-101",
    unitKind: "unit",
    bedrooms: 3,
    bathrooms: 2,
    sizeSqm: 145,
    floor: "5",
    view: "Garden",
    price: 1250000,
  }));
});
