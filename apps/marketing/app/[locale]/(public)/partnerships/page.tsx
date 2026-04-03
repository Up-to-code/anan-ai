import { redirect } from "next/navigation";
import { getPartnerUrl } from "@/lib/site";

export default function PartnershipsPage() {
  redirect(getPartnerUrl());
}
