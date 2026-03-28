import { ClientAssistantPage } from "@/client_zone/pages/ClientAssistantPage";

type AssistantRouteProps = {
  searchParams: Promise<{ prompt?: string; threadId?: string }>;
};

export default async function AssistantRoute({ searchParams }: AssistantRouteProps) {
  const params = await searchParams;
  return <ClientAssistantPage initialPrompt={params.prompt ?? null} initialThreadId={params.threadId ?? null} />;
}
