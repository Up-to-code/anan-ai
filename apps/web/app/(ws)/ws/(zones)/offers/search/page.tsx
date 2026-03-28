import { redirect } from "next/navigation";

export default async function SearchOffersPage() {
  redirect("/ws/offers");
}
