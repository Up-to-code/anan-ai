import { ClientAssistantPage } from "@/client_zone/pages/ClientAssistantPage";

type HomePageProps = {
  searchParams: Promise<{ prompt?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  return <ClientAssistantPage initialPrompt={(await searchParams).prompt ?? null} />;
}
