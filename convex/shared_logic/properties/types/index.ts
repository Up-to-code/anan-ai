import type { Infer } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import { uploadedFileReferenceValidator } from "../../files";

export type PropertyStatus = "available" | "sold" | "reserved";
export type PropertyPublicationState = "draft" | "published" | "archived";
export type OwnerScopedOwnerField = "brokerId" | "REDId";
export type OwnerScopedOwnerId = Id<"brokers"> | Id<"RED">;

export type OwnerScopedPropertyWriteFields = {
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  description: string;
  location?: string;
  area?: string;
  status?: PropertyStatus;
  publicationState?: PropertyPublicationState;
  bankId?: Id<"banks">;
  media?: Infer<typeof uploadedFileReferenceValidator>[];
  body?: unknown;
  adLicenseNumber?: string;
};

export type OwnerScopedPropertyUpdateArgs = Partial<OwnerScopedPropertyWriteFields> & {
  id: Id<"properties">;
};

export type BrokerPropertyCreateArgs = OwnerScopedPropertyWriteFields & {
  brokerId: Id<"brokers">;
};

export type RedPropertyCreateArgs = OwnerScopedPropertyWriteFields & {
  REDId: Id<"RED">;
};
