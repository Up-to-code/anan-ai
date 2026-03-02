import { useParams, useNavigate, Link } from "react-router-dom";
import { useAdminGetProperty, useAdminUpdateProperty } from "@/admin_zone/api/useAdminProperties";
import { useAdminListPartners } from "@/admin_zone/api/useAdminPartners";
import { useAdminListBanks } from "@/admin_zone/api/useAdminBanks";
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/public_zone/ui/breadcrumb";
import { Skeleton } from "@/public_zone/ui/skeleton";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(1),
  address: z.string().min(1),
  price: z.coerce.number().min(0),
  beds: z.coerce.number().int().min(0),
  baths: z.coerce.number().int().min(0),
  sqft: z.coerce.number().optional(),
  description: z.string(),
  location: z.string().optional(),
  area: z.string().optional(),
  status: z.enum(["available", "sold", "reserved"]).optional(),
  partnerId: z.string().optional(),
  bankId: z.string().optional(),
});

export default function PropertyEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { property, isLoading } = useAdminGetProperty(id);
  const { partners } = useAdminListPartners();
  const { banks } = useAdminListBanks();
  const { updateProperty } = useAdminUpdateProperty();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      address: "",
      price: 0,
      beds: 0,
      baths: 0,
      description: "",
      status: "available",
    },
  });

  useEffect(() => {
    if (property) {
      form.reset({
        title: property.title,
        address: property.address,
        price: property.price,
        beds: property.beds,
        baths: property.baths,
        sqft: property.sqft ?? undefined,
        description: property.description,
        location: property.location ?? "",
        area: property.area ?? "",
        status: (property.status ?? "available") as "available" | "sold" | "reserved",
        partnerId: property.partnerId ?? "",
        bankId: property.bankId ?? "",
      });
    }
  }, [property, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!id) return;
    try {
      await updateProperty({
        id: id as Id<"properties">,
        title: values.title,
        address: values.address,
        price: values.price,
        beds: values.beds,
        baths: values.baths,
        sqft: values.sqft ?? undefined,
        description: values.description,
        location: values.location || undefined,
        area: values.area || undefined,
        status: values.status,
        partnerId: values.partnerId && values.partnerId !== "" ? (values.partnerId as Id<"partners">) : undefined,
        bankId: values.bankId && values.bankId !== "" ? (values.bankId as Id<"banks">) : undefined,
      });
      toast.success("Property updated");
      navigate(`/admin/properties/${id}`);
    } catch {
      toast.error("Failed to update property");
    }
  });

  if (!id) return <p className="text-muted-foreground">No property selected</p>;
  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (!property) return <p className="text-muted-foreground">Property not found</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/properties">Properties</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/admin/properties/${id}`}>{property.title}</Link>
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
          <CardTitle>Edit property</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="beds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beds</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Baths</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sqft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SQFT (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partnerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select partner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {(partners ?? []).map((p) => (
                          <SelectItem key={p._id} value={p._id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {(banks ?? []).map((b) => (
                          <SelectItem key={b._id} value={b._id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" asChild>
                  <Link to={`/admin/properties/${id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
