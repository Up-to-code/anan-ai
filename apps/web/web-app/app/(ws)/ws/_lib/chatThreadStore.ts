/**
 * WHY:   The workspace AI chat needs thread-scoped conversation state shared between
 *        the main dashboard input, the AI page, and the sidebar thread list.
 * WHAT:  A simple in-memory store backed by a Zustand-like reactive pattern using
 *        vanilla React subscribe/emit so it works across Client Component boundaries
 *        without needing a Provider wrapper in the root layout.
 * HOW:   Exporting mutable state with a stable reference and a listener list so any
 *        component can subscribe and re-render when threads change.
 */

export type ChatMessage =
    | { role: "user"; content: string }
    | { role: "bot"; content?: string; cards?: unknown[]; variant?: "info"; avatarState?: string };

export type ChatThread = {
    id: string;
    title: string;
    createdAt: number;
    messages: ChatMessage[];
};

type Listener = () => void;

// Singleton state — survives navigation within the SPA shell without needing localStorage.
let threads: ChatThread[] = [];
const listeners = new Set<Listener>();

function notify() {
    listeners.forEach((fn) => fn());
}

export const chatThreadStore = {
    getThreads(): ChatThread[] {
        return threads;
    },

    getThread(id: string): ChatThread | undefined {
        return threads.find((t) => t.id === id);
    },

    createThread(firstMessage: string): ChatThread {
        const id = `thread-${Date.now()}`;
        const title = firstMessage.length > 40 ? `${firstMessage.slice(0, 40)}…` : firstMessage;
        const thread: ChatThread = {
            id,
            title,
            createdAt: Date.now(),
            messages: [],
        };
        threads = [thread, ...threads];
        notify();
        return thread;
    },

    appendMessage(threadId: string, message: ChatMessage) {
        threads = threads.map((t) =>
            t.id === threadId ? { ...t, messages: [...t.messages, message] } : t,
        );
        notify();
    },

    renameThread(threadId: string, newTitle: string) {
        threads = threads.map((t) =>
            t.id === threadId ? { ...t, title: newTitle } : t,
        );
        notify();
    },

    deleteThread(threadId: string) {
        threads = threads.filter((t) => t.id !== threadId);
        notify();
    },

    subscribe(fn: Listener): () => void {
        listeners.add(fn);
        return () => listeners.delete(fn);
    },
};
