import { redirect } from "next/navigation";

export default async function InboxConversationPage({
  params,
}: {
  params: { conversationId: string } | Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await Promise.resolve(params);
  redirect(`/ws/inbox?conversationId=${encodeURIComponent(conversationId)}`);
}
