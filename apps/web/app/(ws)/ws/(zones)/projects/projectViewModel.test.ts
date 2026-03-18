import { describe, expect, it } from "vitest";
import type { PropertyDetail } from "@/server/contracts/properties";
import { mapWorkspaceProjectToPropertyInput } from "./projectViewModel";

describe("projectViewModel", () => {
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
      rooms: "4",
      baths: "5",
      area: "420",
      images,
      adLicenseNumber: "  AD-1234  ",
    });

    expect(mapped.title).toBe("برج الياسمين");
    expect(mapped.location).toBe("الرياض، الياسمين");
    expect(mapped.media).toEqual(images);
    expect(mapped.price).toBe(2500000);
    expect(mapped.sqft).toBe(420);
    expect(mapped.adLicenseNumber).toBe("AD-1234");
  });

  it("maps invalid numeric fields to safe defaults", () => {
    const mapped = mapWorkspaceProjectToPropertyInput({
      name: "مشروع تجريبي",
      price: "غير محدد",
      location: "الرياض",
      description: "وصف",
      rooms: "",
      baths: "غير معروف",
      area: "n/a",
      images: [],
    });

    expect(mapped.price).toBe(0);
    expect(mapped.beds).toBe(0);
    expect(mapped.baths).toBe(0);
    expect(mapped.sqft).toBeUndefined();
    expect(mapped.media).toEqual([]);
  });
});
