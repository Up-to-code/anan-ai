import { useState } from "react";
import { Badge } from "@/public_zone/ui/badge";
import { Button } from "@/public_zone/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { Skeleton } from "@/public_zone/ui/skeleton";
import { useAdminUserThreads, useAdminThreadMessages } from "@/admin_zone/api/useAdminUsers";

/**
 * WHY:   Displays the isolated message history for a specific AI conversation thread.
 * WHAT:  Fetches and paginates messages within a given thread ID.
 * HOW:   Uses `useAdminThreadMessages` and renders a list of user/assistant bubbles.
 */
function ThreadMessages({ threadId }: { threadId: string }) {
    const { messages, status, loadMore } = useAdminThreadMessages(threadId);

    return (
        <div className="space-y-2 border-t pt-4">
            <p className="text-sm font-medium">Messages</p>
            {status === "LoadingFirstPage" ? (
                <Skeleton className="h-[100px] w-full" />
            ) : messages.length === 0 ? (
                <p className="text-muted-foreground text-sm">No messages in this thread</p>
            ) : (
                <ul className="space-y-2">
                    {messages.map((msg: { role?: string; text?: string; content?: string; _id?: string }, i: number) => (
                        <li key={(msg as { _id?: string })._id ?? i} className="rounded border p-2 text-sm">
                            <Badge variant="outline" className="mr-2">
                                {(msg as { role?: string }).role ?? "—"}
                            </Badge>
                            {(msg as { text?: string }).text ?? (msg as { content?: string }).content ?? "—"}
                        </li>
                    ))}
                    {status === "CanLoadMore" && (
                        <Button variant="outline" size="sm" onClick={() => loadMore(20)}>
                            Load more messages
                        </Button>
                    )}
                </ul>
            )}
        </div>
    );
}

/**
 * WHY:   Allows admins to inspect an AI's conversational history with a specific user.
 * WHAT:  Renders a master/detail view of all threads for the user, and clicking a thread 
 *        reveals the detailed messages.
 * HOW:   Fetches thread list via `useAdminUserThreads`, manages local `selectedThreadId` state,
 *        and delegates message rendering to the `ThreadMessages` sub-component.
 */
export function ConversationTab({ userId }: { userId: string }) {
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const { threads, status, loadMore } = useAdminUserThreads(userId);

    if (status === "LoadingFirstPage") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Conversations</CardTitle>
                    <CardDescription>Agent threads and messages</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>Agent threads and messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {threads.length === 0 ? (
                    <p className="text-muted-foreground">No conversations yet</p>
                ) : (
                    <>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Threads</p>
                            <ul className="space-y-1">
                                {threads.map((thread) => {
                                    const tid = String((thread as { _id?: string; threadId?: string })._id ?? (thread as { threadId?: string }).threadId ?? "");
                                    return (
                                        <li key={tid}>
                                            <Button
                                                variant={selectedThreadId === tid ? "secondary" : "ghost"}
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => setSelectedThreadId(tid)}
                                            >
                                                Thread {tid.slice(-8)}
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                            {status === "CanLoadMore" && (
                                <Button variant="outline" size="sm" onClick={() => loadMore(10)}>
                                    Load more threads
                                </Button>
                            )}
                        </div>
                        {selectedThreadId && (
                            <ThreadMessages threadId={selectedThreadId} />
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
