import { useParams, useNavigate, Link } from "react-router-dom";
import { useAdminGetKnowledge, useAdminUpdateKnowledge } from "@/admin_zone/api/useAdminKnowledge";
import type { Id } from "convex/_generated/dataModel";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/public_zone/ui/button";
import { Input } from "@/public_zone/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/public_zone/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/public_zone/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/public_zone/ui/breadcrumb";
import { Skeleton } from "@/public_zone/ui/skeleton";
import { toast } from "sonner";

const schema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string(),
  category: z.string().optional(),
});

export default function KnowledgeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { page, isLoading } = useAdminGetKnowledge(id);
  const { updateKnowledgePage } = useAdminUpdateKnowledge();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: "",
      title: "",
      content: "",
      category: "",
    },
  });

  useEffect(() => {
    if (page) {
      form.reset({
        slug: page.slug,
        title: page.title,
        content: page.content,
        category: page.category ?? "",
      });
    }
  }, [page, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!id) return;
    try {
      await updateKnowledgePage({
        id: id as Id<"knowledgePages">,
        slug: values.slug,
        title: values.title,
        content: values.content,
        category: values.category || undefined,
      });
      toast.success("Knowledge page updated");
      navigate(`/admin/knowledge/${id}`);
    } catch {
      toast.error("Failed to update knowledge page");
    }
  });

  if (!id) return <p className="text-muted-foreground">No page selected</p>;
  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (!page) return <p className="text-muted-foreground">Knowledge page not found</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/knowledge">Knowledge</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/admin/knowledge/${id}`}>{page.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Edit knowledge page</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="page-slug" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Page title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. faq, guides" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        placeholder="Page content (markdown or plain text)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" asChild>
                  <Link to={`/admin/knowledge/${id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
