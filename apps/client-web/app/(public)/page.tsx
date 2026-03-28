import { ClientAssistantPage } from "@/client_zone/pages/ClientAssistantPage";

type HomePageProps = {
  searchParams: Promise<{ prompt?: string; threadId?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  return <ClientAssistantPage initialPrompt={params.prompt ?? null} initialThreadId={params.threadId ?? null} />;
}
