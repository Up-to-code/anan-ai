import type { UploadedFileReference } from "@/server/contracts/files";

export type AgPropertyFormState = {
  name: string;
  price: string;
  location: string;
  description: string;
  rooms: string;
  baths: string;
  area: string;
  status: string;
  images: UploadedFileReference[];
  video: string | null;
  adLicenseNumber: string;
};
