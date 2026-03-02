import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAdminUserDetail } from "@/admin_zone/api/useAdminUsers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/public_zone/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public_zone/ui/tabs";
import { Avatar, AvatarFallback } from "@/public_zone/ui/avatar";
import { Badge } from "@/public_zone/ui/badge";
import { Button } from "@/public_zone/ui/button";
import { Skeleton } from "@/public_zone/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/public_zone/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/public_zone/ui/form";
import { Input } from "@/public_zone/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public_zone/ui/select";
import { toast } from "sonner";

import { ConversationTab } from "./tabs/Conversations";

const userEditSchema = z.object({
  displayName: z.string().optional(),
  channel: z.enum(["whatsapp", "app", "web"]).optional(),
});

/**
 * WHY:   Provides the master orchestrator view for inspecting a specific user in the admin panel.
 * WHAT:  Fetches top-level user details (logs, memory, stats) and renders the layout shell with tabs.
 * HOW:   Uses `useAdminUserDetail` to pull root user data. Does not render sub-views directly,
 *        but delegates to isolated Tab components for complex logic.
 */
export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const userId = id ?? "";

  const { detail, research, logs, memory, updateUser, isLoading } = useAdminUserDetail(userId);

  if (!userId) {
    return <p className="text-muted-foreground">No user selected</p>;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">User not found</p>
        <Button variant="outline" asChild>
          <Link to="/admin/users">Back to users</Link>
        </Button>
      </div>
    );
  }

  const { user, counts } = detail;
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      displayName: user.displayName ?? "",
      channel: (user.channel as "whatsapp" | "app" | "web") ?? undefined,
    },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) form.reset({ displayName: user.displayName ?? "", channel: user.channel as "whatsapp" | "app" | "web" | undefined });
  };

  const onEditSubmit = form.handleSubmit(async (values) => {
    try {
      await updateUser({
        userId,
        displayName: values.displayName || undefined,
        channel: values.channel,
      });
      toast.success("User updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update user");
    }
  });

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/users">Users</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user.displayName ?? user.userId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {(user.displayName ?? user.userId).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.displayName ?? user.userId}</CardTitle>
              <CardDescription>{user.userId}</CardDescription>
              <Badge variant="outline" className="mt-2">{user.channel ?? "—"}</Badge>
            </div>
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit user</DialogTitle>
                <DialogDescription>Update display name and channel.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={onEditSubmit} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Display name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="channel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channel</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select channel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="app">App</SelectItem>
                            <SelectItem value="web">Web</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm">
            <span>Knowledge research: {counts.knowledgeResearch}</span>
            <span>Search logs: {counts.searchLogs}</span>
            <span>Memory: {counts.agentMemory}</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="searches">
        <TabsList>
          <TabsTrigger value="searches">Searches</TabsTrigger>
          <TabsTrigger value="research">Knowledge Research</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
        </TabsList>
        <TabsContent value="searches">
          <Card>
            <CardHeader>
              <CardTitle>Search logs</CardTitle>
              <CardDescription>Recent search activity</CardDescription>
            </CardHeader>
            <CardContent>
              {!logs ? (
                <Skeleton className="h-[200px] w-full" />
              ) : logs.length === 0 ? (
                <p className="text-muted-foreground">No search logs</p>
              ) : (
                <ul className="space-y-2">
                  {logs.map((l) => (
                    <li key={l._id} className="rounded border p-2 text-sm">
                      <div>{l.query ?? "—"}</div>
                      <div className="text-muted-foreground text-xs">
                        {l.channel ?? "—"} · {l.status ?? "—"} ·{" "}
                        {l._creationTime
                          ? new Date(l._creationTime * 1000).toLocaleString()
                          : "—"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="research">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge research</CardTitle>
              <CardDescription>Research sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {!research ? (
                <Skeleton className="h-[200px] w-full" />
              ) : research.length === 0 ? (
                <p className="text-muted-foreground">No knowledge research</p>
              ) : (
                <ul className="space-y-2">
                  {research.map((r) => (
                    <li key={r._id} className="rounded border p-2 text-sm">
                      <div>{r.query}</div>
                      <div className="text-muted-foreground text-xs">
                        {r.status} ·{" "}
                        {new Date(r.createdAt * 1000).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="memory">
          <Card>
            <CardHeader>
              <CardTitle>Agent memory</CardTitle>
              <CardDescription>Preferences and facts</CardDescription>
            </CardHeader>
            <CardContent>
              {!memory ? (
                <Skeleton className="h-[200px] w-full" />
              ) : memory.length === 0 ? (
                <p className="text-muted-foreground">No memory entries</p>
              ) : (
                <ul className="space-y-2">
                  {memory.map((m) => (
                    <li key={m._id} className="rounded border p-2 text-sm">
                      <Badge variant="outline" className="mr-2">{m.memoryType}</Badge>
                      <strong>{m.key}:</strong> {m.value}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="conversation">
          {/* Orchestrator delegation: */}
          <ConversationTab userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
