import { useNavigate } from "react-router-dom";
import { PropertyForm } from "@/shared_logic/properties/components/PropertyForm";
import type { PropertyFormValues } from "@/shared_logic/properties/components/PropertyForm";
import { useSharedProperties } from "@/shared_logic/hooks/useSharedProperties";
import { toast } from "sonner";
import type { Id } from "convex/_generated/dataModel";
import { useUserData } from "@/_core/hooks/useUserData";

export default function PropertyCreate() {
    const navigate = useNavigate();
    const { role, banks, createProperty } = useSharedProperties();
    const { isVerified } = useUserData();

    const onSubmit = async (values: PropertyFormValues) => {
        try {
            const payload = {
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

            let id;
            if (role === "broker" || role === "RED") {
                id = await createProperty(payload);
            } else {
                throw new Error("Unauthorized role");
            }

            toast.success(isVerified ? "تم إنشاء العقار بنجاح" : "تم حفظ العقار كمسودة. أكمل التوثيق للنشر.");
            navigate(`/dashboard/${role}/properties/${id}`);
        } catch (error) {
            console.error(error);
            toast.error("فشل في إنشاء العقار");
        }
    };

    const cancelHref = role ? `/dashboard/${role}/properties` : "/dashboard";

    return (
        <PropertyForm
            title="إضافة عقار جديد"
            subtitle="أدخل تفاصيل الوحدة العقارية ليتم عرضها في المنصة"
            onSubmit={onSubmit}
            banks={banks}
            cancelHref={cancelHref}
        />
    );
}
