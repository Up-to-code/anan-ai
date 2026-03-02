import { useParams, useNavigate, Link } from "react-router-dom";
import { useAdminGetPartner, useAdminUpdatePartner } from "@/admin_zone/api/useAdminPartners";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public_zone/ui/select";
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
  status: z.enum(["active", "pending"]).optional(),
  contactEmail: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
});

export default function PartnerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { partner, isLoading } = useAdminGetPartner(id);
  const { updatePartner } = useAdminUpdatePartner();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (partner) {
      form.reset({
        name: partner.name,
        slug: partner.slug,
        status: (partner.status ?? "active") as "active" | "pending",
        contactEmail: partner.contactEmail ?? "",
        phone: partner.phone ?? "",
        description: partner.description ?? "",
        website: partner.website ?? "",
        notes: partner.notes ?? "",
      });
    }
  }, [partner, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!id) return;
    try {
      await updatePartner({
        id: id as Id<"RED">,
        name: values.name,
        slug: values.slug,
        status: values.status,
        contactEmail: values.contactEmail || undefined,
        phone: values.phone || undefined,
        description: values.description || undefined,
        website: values.website || undefined,
        notes: values.notes || undefined,
      });
      toast.success("Partner updated");
      navigate(`/admin/partners/${id}`);
    } catch {
      toast.error("Failed to update partner");
    }
  });

  if (!id) return <p className="text-muted-foreground">No partner selected</p>;
  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (!partner) return <p className="text-muted-foreground">Partner not found</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/partners">Partners</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/admin/partners/${id}`}>{partner.name}</Link>
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
          <CardTitle>Edit partner</CardTitle>
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
                      <Input {...field} placeholder="Partner name" />
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
                      <Input {...field} placeholder="partner-slug" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact email (optional)</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="email@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1234567890" />
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
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Internal notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" asChild>
                  <Link to={`/admin/partners/${id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
