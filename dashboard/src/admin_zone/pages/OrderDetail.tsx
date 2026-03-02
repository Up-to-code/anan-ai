import { useParams, Link } from "react-router-dom";
import { useAdminGetOrder, useAdminUpdateOrder, useAdminOrderRelations } from "@/admin_zone/api/useAdminOrders";
import type { Id } from "convex/_generated/dataModel";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/public_zone/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public_zone/ui/select";
import { Input } from "@/public_zone/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const STATUSES = [
  "new_lead",
  "contacted",
  "qualified",
  "offer_made",
  "under_contract",
  "closed_won",
  "closed_lost",
] as const;

const schema = z.object({
  status: z.enum(STATUSES),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { order, isLoading } = useAdminGetOrder(id);
  const { property, bank, partner } = useAdminOrderRelations(order);
  const { updateOrder } = useAdminUpdateOrder();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "new_lead",
      notes: "",
      assignedTo: "",
    },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && order) {
      form.reset({
        status: order.status as (typeof STATUSES)[number],
        notes: order.notes ?? "",
        assignedTo: order.assignedTo ?? "",
      });
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!id) return;
    try {
      await updateOrder({
        id: id as Id<"orders">,
        status: values.status,
        notes: values.notes || undefined,
        assignedTo: values.assignedTo || undefined,
      });
      toast.success("Order updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update order");
    }
  });

  if (!id) return <p className="text-muted-foreground">No order selected</p>;
  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (!order) return <p className="text-muted-foreground">Order not found</p>;

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/pipeline">Pipeline</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Order {id.slice(-8)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Order details</CardTitle>
            <Badge variant="outline" className="mt-2">
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit order</DialogTitle>
                <DialogDescription>
                  Update status, notes, or assigned agent.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-4">
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
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.replace(/_/g, " ")}
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
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned to</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Agent or user ID" />
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
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Internal notes" />
                        </FormControl>
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
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-sm">
            <p>
              <strong>Type:</strong> {order.type}
            </p>
            <p>
              <strong>User:</strong>{" "}
              <Link
                to={`/admin/users/${order.userId}`}
                className="text-primary hover:underline"
              >
                {order.userId}
              </Link>
            </p>
            <p>
              <strong>Channel:</strong> {order.sourceChannel ?? "—"}
            </p>
            <p>
              <strong>Intent:</strong> {order.intent ?? "—"}
            </p>
            <p>
              <strong>Assigned to:</strong> {order.assignedTo ?? "—"}
            </p>
            <p>
              <strong>Notes:</strong> {order.notes ?? "—"}
            </p>
            {order.propertyId && (
              <p>
                <strong>Property:</strong>{" "}
                {property ? (
                  <Link
                    to={`/admin/properties/${order.propertyId}`}
                    className="text-primary hover:underline"
                  >
                    {property.title}
                  </Link>
                ) : (
                  order.propertyId
                )}
              </p>
            )}
            {order.bankId && (
              <p>
                <strong>Bank:</strong>{" "}
                {bank ? (
                  <Link
                    to={`/admin/banks/${order.bankId}`}
                    className="text-primary hover:underline"
                  >
                    {bank.name}
                  </Link>
                ) : (
                  order.bankId
                )}
              </p>
            )}
            {order.partnerId && (
              <p>
                <strong>Partner:</strong>{" "}
                {partner ? (
                  <Link
                    to={`/admin/partners/${order.partnerId}`}
                    className="text-primary hover:underline"
                  >
                    {partner.name}
                  </Link>
                ) : (
                  order.partnerId
                )}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
