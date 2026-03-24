import { ClientAssistantPage } from "@/client_zone/pages/ClientAssistantPage";

type AssistantRouteProps = {
  searchParams: Promise<{ prompt?: string }>;
};

export default async function AssistantRoute({ searchParams }: AssistantRouteProps) {
  return <ClientAssistantPage initialPrompt={(await searchParams).prompt ?? null} />;
}
