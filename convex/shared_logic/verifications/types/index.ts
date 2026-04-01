import type { Doc } from "../../../_generated/dataModel";

export type VerificationRequestRecord = Doc<"verificationRequests">;
export type VerificationStatus = VerificationRequestRecord["currentStatus"];
export type ReviewStatus = Exclude<VerificationStatus, "new">;
export type VerificationRequestType = VerificationRequestRecord["requestType"];
export type VerificationOrganizationType = "broker" | "red";

export type OrganizationVerificationSubmittedData = {
  requirements: string[];
  sourceUrls: string[];
  notes: string | null;
  organizationType: VerificationOrganizationType;
};

export type PropertyVerificationSubmittedData = {
  adLicenseNumber: string;
  notes: string | null;
};

export type VerificationProfileRecord = Doc<"userProfiles">;
export type VerificationBrokerRecord = Doc<"brokers">;
export type VerificationDeveloperRecord = Doc<"RED">;
export type VerificationPropertyRecord = Doc<"properties">;

export type VerificationLookups = {
  profiles: VerificationProfileRecord[];
  brokers: VerificationBrokerRecord[];
  developers: VerificationDeveloperRecord[];
  properties: VerificationPropertyRecord[];
};
