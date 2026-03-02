import { useNavigate, Link } from "react-router-dom";
import { useAdminCreateBank } from "@/admin_zone/api/useAdminBanks";
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
  name: z.string().min(1),
  slug: z.string().min(1),
  contactEmail: z.string().min(1, "Contact email is required"),
  description: z.string().optional(),
});

export default function BankCreate() {
  const navigate = useNavigate();
  const { createBank } = useAdminCreateBank();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      contactEmail: "",
      description: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const id = await createBank({
        name: values.name,
        slug: values.slug,
        contactEmail: values.contactEmail,
        description: values.description || undefined,
      });
      toast.success("Bank created");
      navigate(`/admin/banks/${id}`);
    } catch {
      toast.error("Failed to create bank");
    }
  });

  return (
    <div className="max-w-2xl space-y-4">
      <Button variant="outline" size="sm" asChild>
        <Link to="/admin/banks">Back</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Create bank</CardTitle>
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
              <Button type="submit">Create</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
