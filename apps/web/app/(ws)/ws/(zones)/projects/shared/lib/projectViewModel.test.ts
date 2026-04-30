import { expect, it } from "vitest";
import type { PropertyDetail } from "@/server/contracts/properties";
import { mapWorkspaceProjectToDossierInput, mapWorkspaceProjectToPropertyInput, mapWorkspaceProjectToUnitInputs } from "./projectViewModel";

it("preserves uploaded images as media references", () => {
  const images: PropertyDetail["media"] = [
    {
      key: "file-1",
      url: "https://ufs.sh/f/file-1",
      name: "cover.jpg",
      size: 1024,
      mime: "image/jpeg",
    },
    {
      key: "file-2",
      url: "https://ufs.sh/f/file-2",
      name: "lobby.jpg",
    },
  ];

  const mapped = mapWorkspaceProjectToPropertyInput({
    name: "  برج الياسمين  ",
    price: "2,500,000 ر.س",
    location: "  الرياض، الياسمين  ",
    description: "  مشروع سكني متكامل  ",
    shortDescription: "  واجهة هادئة مع مداخل خاصة  ",
    amenitiesText: "مسبح، نادي، حراسة",
    hasParking: true,
    parkingSpaces: "3",
    coverImageKey: "file-2",
    galleryDisplayMode: "fit",
    galleryAspectRatio: "square",
    privatePermitSummary: "  تصريح مخصص للطرف المستلم  ",
    privatePermitFiles: [
      {
        key: "permit-1",
        url: "https://ufs.sh/f/permit-1",
        name: "permit.pdf",
      },
    ],
    rooms: "4",
    baths: "5",
    area: "420",
    status: "active",
    clientVisibility: "public",
    images,
    adLicenseNumber: "  AD-1234  ",
  });

  expect(mapped.title).toBe("برج الياسمين");
  expect(mapped.location).toBe("الرياض، الياسمين");
  expect(mapped.media).toEqual([images[1], images[0]]);
  expect(mapped.price).toBe(2500000);
  expect(mapped.sqft).toBe(420);
  expect(mapped.adLicenseNumber).toBe("AD-1234");
  expect(mapped.status).toBe("available");
  expect(mapped.publicationState).toBe("published");
  expect(mapped.media?.[0]?.key).toBe("file-2");
  expect(mapped.body).toEqual({
    presentation: {
      descriptionShort: "واجهة هادئة مع مداخل خاصة",
      amenities: ["مسبح", "نادي", "حراسة"],
      parkingSpaces: 3,
      hasParking: true,
      slides: [images[1], images[0]],
      coverImageKey: "file-2",
      galleryDisplayMode: "fit",
      galleryAspectRatio: "square",
      privatePermitSummary: "تصريح مخصص للطرف المستلم",
      privatePermitFiles: [
        {
          key: "permit-1",
          url: "https://ufs.sh/f/permit-1",
          name: "permit.pdf",
        },
      ],
      privatePermitVisibility: "conversation_only",
    },
  });
});

it("maps invalid numeric fields to safe defaults", () => {
  const mapped = mapWorkspaceProjectToPropertyInput({
    name: "مشروع تجريبي",
    price: "غير محدد",
    location: "الرياض",
    description: "وصف",
    shortDescription: "",
    amenitiesText: "",
    hasParking: false,
    parkingSpaces: "",
    coverImageKey: null,
    galleryDisplayMode: "cover",
    galleryAspectRatio: "landscape",
    privatePermitSummary: "",
    privatePermitFiles: [],
    rooms: "",
    baths: "غير معروف",
    area: "n/a",
    status: "pending",
    clientVisibility: "private",
    images: [],
  });

  expect(mapped.price).toBe(0);
  expect(mapped.beds).toBe(0);
  expect(mapped.baths).toBe(0);
  expect(mapped.sqft).toBeUndefined();
  expect(mapped.status).toBe("reserved");
  expect(mapped.publicationState).toBe("draft");
  expect(mapped.media).toEqual([]);
  expect(mapped.body).toEqual({
    presentation: {
      descriptionShort: undefined,
      amenities: undefined,
      parkingSpaces: undefined,
      hasParking: false,
      coverImageKey: undefined,
      galleryDisplayMode: "cover",
      galleryAspectRatio: "landscape",
      slides: [],
      privatePermitSummary: undefined,
      privatePermitFiles: undefined,
      privatePermitVisibility: undefined,
    },
  });
});

it("derives the legacy projection numbers from unit inventory first", () => {
  const mapped = mapWorkspaceProjectToPropertyInput({
    name: "Project shell",
    price: "",
    location: "Riyadh",
    description: "Parent project data",
    shortDescription: "",
    amenitiesText: "",
    hasParking: false,
    parkingSpaces: "",
    coverImageKey: null,
    galleryDisplayMode: "cover",
    galleryAspectRatio: "landscape",
    privatePermitSummary: "",
    privatePermitFiles: [],
    rooms: "",
    baths: "",
    area: "",
    status: "active",
    clientVisibility: "private",
    images: [],
    units: [{
      label: "1BR Type A",
      unitKind: "unit_type",
      status: "available",
      bedrooms: "1",
      bathrooms: "2",
      sizeSqm: "84",
      floor: "",
      view: "",
      price: "980,000",
      handoverAt: "",
      locationDetails: {
        label: "Riyadh, Al Narjis",
        city: "Riyadh",
        district: "Al Narjis",
        latitude: 24.84,
        longitude: 46.69,
      },
      floorPlanMedia: [],
    }],
  });

  expect(mapped.price).toBe(980000);
  expect(mapped.beds).toBe(1);
  expect(mapped.baths).toBe(2);
  expect(mapped.sqft).toBe(84);
});

it("preserves project and unit coordinates in dossier and unit payloads", () => {
  const payload = {
    name: "Project shell",
    price: "",
    location: "Riyadh, Al Narjis",
    description: "Parent project data",
    shortDescription: "",
    amenitiesText: "",
    hasParking: false,
    parkingSpaces: "",
    coverImageKey: null,
    galleryDisplayMode: "cover" as const,
    galleryAspectRatio: "landscape" as const,
    privatePermitSummary: "",
    privatePermitFiles: [],
    rooms: "",
    baths: "",
    area: "",
    status: "active",
    clientVisibility: "private" as const,
    images: [],
    dossier: {
      projectType: "ready_property" as const,
      lifecycleStage: "draft" as const,
      salesMode: "developer_direct" as const,
      city: "Riyadh",
      district: "Al Narjis",
      neighborhood: "",
      street: "",
      nationalAddress: "",
      latitude: "24.84",
      longitude: "46.69",
    },
    units: [{
      label: "1BR Type A",
      unitKind: "unit_type" as const,
      status: "available" as const,
      bedrooms: "1",
      bathrooms: "2",
      sizeSqm: "84",
      floor: "",
      view: "",
      price: "980,000",
      handoverAt: "",
      locationDetails: {
        label: "Riyadh, Al Narjis",
        city: "Riyadh",
        district: "Al Narjis",
        latitude: 24.84,
        longitude: 46.69,
      },
      floorPlanMedia: [],
    }],
  };

  expect(mapWorkspaceProjectToDossierInput("property-1", payload).location).toEqual(expect.objectContaining({
    city: "Riyadh",
    district: "Al Narjis",
    latitude: 24.84,
    longitude: 46.69,
  }));
  expect(mapWorkspaceProjectToUnitInputs(payload)[0]?.location).toEqual(expect.objectContaining({
    city: "Riyadh",
    district: "Al Narjis",
    latitude: 24.84,
    longitude: 46.69,
  }));
});
