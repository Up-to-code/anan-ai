import { useParams, useNavigate, Link } from "react-router-dom";
import { useAdminGetBank, useAdminUpdateBank } from "@/admin_zone/api/useAdminBanks";
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
  name: z.string().min(1),
  slug: z.string().min(1),
  contactEmail: z.string().min(1, "Contact email is required"),
  description: z.string().optional(),
});

export default function BankEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bank, isLoading } = useAdminGetBank(id);
  const { updateBank } = useAdminUpdateBank();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      contactEmail: "",
      description: "",
    },
  });

  useEffect(() => {
    if (bank) {
      form.reset({
        name: bank.name,
        slug: bank.slug,
        contactEmail: bank.contactEmail,
        description: bank.description ?? "",
      });
    }
  }, [bank, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!id) return;
    try {
      await updateBank({
        id: id as Id<"banks">,
        name: values.name,
        slug: values.slug,
        contactEmail: values.contactEmail,
        description: values.description || undefined,
      });
      toast.success("Bank updated");
      navigate(`/admin/banks/${id}`);
    } catch {
      toast.error("Failed to update bank");
    }
  });

  if (!id) return <p className="text-muted-foreground">No bank selected</p>;
  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (!bank) return <p className="text-muted-foreground">Bank not found</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/banks">Banks</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/admin/banks/${id}`}>{bank.name}</Link>
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
          <CardTitle>Edit bank</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Bank name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="bank-slug" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="contact@bank.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" asChild>
                  <Link to={`/admin/banks/${id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
