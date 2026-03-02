import { useNavigate, Link } from "react-router-dom";
import { useAdminCreateKnowledge } from "@/admin_zone/api/useAdminKnowledge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toast } from "sonner";

const schema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string(),
  category: z.string().optional(),
});

export default function KnowledgeCreate() {
  const navigate = useNavigate();
  const { createKnowledgePage } = useAdminCreateKnowledge();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: "",
      title: "",
      content: "",
      category: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const id = await createKnowledgePage({
        slug: values.slug,
        title: values.title,
        content: values.content,
        category: values.category || undefined,
      });
      toast.success("Knowledge page created");
      navigate(`/admin/knowledge/${id}`);
    } catch {
      toast.error("Failed to create knowledge page");
    }
  });

  return (
    <div className="max-w-2xl space-y-4">
      <Button variant="outline" size="sm" asChild>
        <Link to="/admin/knowledge">Back</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Create knowledge page</CardTitle>
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
              <Button type="submit">Create</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
