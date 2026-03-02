import { useParams, useNavigate } from "react-router-dom";
import { PropertyForm } from "@/shared_logic/properties/components/PropertyForm";
import type { PropertyFormValues } from "@/shared_logic/properties/components/PropertyForm";
import { toast } from "sonner";
import type { Id } from "convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { useSharedProperties } from "@/shared_logic/hooks/useSharedProperties";

export default function PropertyEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getProperty, updateProperty, banks, role } = useSharedProperties();

    const property = getProperty(id);

    const onSubmit = async (values: PropertyFormValues) => {
        if (!id) return;
        try {
            const payload = {
                id: id as Id<"properties">,
                title: values.title,
                address: values.address,
                price: values.price,
                beds: values.beds,
                baths: values.baths,
                sqft: values.sqft || undefined,
                description: values.description,
                status: values.status,
                bankId: values.bankId && values.bankId !== "" ? (values.bankId as Id<"banks">) : undefined,
                imageIds: (values.imageIds as Id<"_storage">[]) || undefined,
            };

            await updateProperty(payload);

            toast.success("تم تحديث العقار بنجاح");
            navigate(`/dashboard/${role}/properties/${id}`);
        } catch (error) {
            console.error(error);
            toast.error("فشل في تحديث العقار");
        }
    };

    if (!property) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const cancelHref = role ? `/dashboard/${role}/properties/${id}` : "/dashboard";

    return (
        <PropertyForm
            title="تعديل العقار"
            subtitle="قم بتحديث معلومات الوحدة العقارية"
            initialValues={{
                ...property,
                bankId: property.bankId || "",
                imageIds: property.imageIds || (property.imageId ? [property.imageId] : []),
            }}
            onSubmit={onSubmit}
            banks={banks}
            cancelHref={cancelHref}
        />
    );
}
