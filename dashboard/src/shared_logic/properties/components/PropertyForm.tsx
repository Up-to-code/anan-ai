import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/public_zone/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/public_zone/ui/form";
import { Input } from "@/public_zone/ui/input";
import { Textarea } from "@/public_zone/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/public_zone/ui/select";
import type { Id } from "convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";
import { useSharedProperties } from "../../hooks/useSharedProperties";

const propertySchema = z.object({
    title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
    address: z.string().min(5, "العنوان التفصيلي مطلوب"),
    price: z.coerce.number().min(1000, "السعر يجب أن يكون 1000 على الأقل"),
    beds: z.coerce.number().min(0),
    baths: z.coerce.number().min(0),
    sqft: z.coerce.number().optional().nullable(),
    description: z.string().min(10, "الوصف يجب أن يكون تفصيلياً"),
    status: z.enum(["available", "reserved", "sold"]),
    bankId: z.string().optional(),
    imageIds: z.array(z.string()).optional(),
});

export type PropertyFormValuesRaw = z.infer<typeof propertySchema>;

export type PropertyFormValues = {
    title: string;
    address: string;
    price: number;
    beds: number;
    baths: number;
    description: string;
    status: "available" | "reserved" | "sold";
    sqft?: number | null;
    bankId?: string;
    imageIds?: string[];
};

interface PropertyFormProps {
    title: string;
    subtitle: string;
    initialValues?: Partial<PropertyFormValues>;
    onSubmit: (values: PropertyFormValues) => Promise<void>;
    banks: any;
    cancelHref: string;
}

export function PropertyForm({
    title,
    subtitle,
    initialValues,
    onSubmit,
    banks,
    cancelHref,
}: PropertyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const { generateUploadUrl } = useSharedProperties();

    // @ts-ignore
    const form = useForm<any>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            title: initialValues?.title || "",
            address: initialValues?.address || "",
            price: initialValues?.price || 0,
            beds: initialValues?.beds || 0,
            baths: initialValues?.baths || 0,
            sqft: initialValues?.sqft || null,
            description: initialValues?.description || "",
            status: initialValues?.status || "available",
            bankId: initialValues?.bankId || "",
            imageIds: initialValues?.imageIds || [],
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingImage(true);
        try {
            const currentIds = form.getValues("imageIds") || [];
            const newIds = [...currentIds];

            for (const file of files) {
                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });
                const { storageId } = await result.json();
                newIds.push(storageId);
            }

            form.setValue("imageIds", newIds, { shouldDirty: true });
            toast.success("تم رفع الصور بنجاح");
        } catch (error) {
            toast.error("حدث خطأ أثناء رفع الصور");
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = (idToRemove: string) => {
        const currentIds = form.getValues("imageIds") || [];
        form.setValue(
            "imageIds",
            currentIds.filter((id) => id !== idToRemove),
            { shouldDirty: true }
        );
    };

    const handleSubmit = async (values: PropertyFormValues) => {
        setIsSubmitting(true);
        try {
            await onSubmit(values);
        } finally {
            setIsSubmitting(false);
        }
    };

    const imageIds = form.watch("imageIds") || [];

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                        {/* Images */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">صور العقار</h3>
                            <div className="flex flex-wrap gap-4">
                                {imageIds.map((id) => (
                                    <div key={id} className="relative h-24 w-32 rounded-lg border overflow-hidden">
                                        <div className="h-full w-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                            صورة مرفوعة
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(id)}
                                            className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <label className="h-24 w-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors group">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                    />
                                    {uploadingImage ? (
                                        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                    ) : (
                                        <>
                                            <Upload className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors mb-2" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">رفع صور</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">التفاصيل الأساسية</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">اسم العقار</FormLabel>
                                            <FormControl>
                                                <Input placeholder="مثال: فيلا سكنية بحي النرجس" {...field} className="bg-slate-50 border-slate-200 focus:bg-white" />
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
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">السعر (ر.س)</FormLabel>
                                            <FormControl>
                                                <Input type="number" dir="ltr" placeholder="0" {...field} className="bg-slate-50 border-slate-200 focus:bg-white font-black" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">العنوان التفصيلي</FormLabel>
                                        <FormControl>
                                            <Input placeholder="مثال: الرياض، حي النرجس، شارع 20" {...field} className="bg-slate-50 border-slate-200 focus:bg-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="beds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">عدد الغرف</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" dir="ltr" {...field} className="bg-slate-50 border-slate-200 focus:bg-white text-center font-bold" />
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">دورات المياه</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" dir="ltr" {...field} className="bg-slate-50 border-slate-200 focus:bg-white text-center font-bold" />
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">المساحة (م²)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" dir="ltr" placeholder="اختياري" value={field.value || ""} onChange={field.onChange} className="bg-slate-50 border-slate-200 focus:bg-white text-center font-bold" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Meta */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">الحالة</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50">
                                                    <SelectValue placeholder="اختر حالة العقار" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="available">متاح</SelectItem>
                                                <SelectItem value="reserved">محجوز</SelectItem>
                                                <SelectItem value="sold">تم البيع</SelectItem>
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">البنك الممول للاوفر (اختياري)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50">
                                                    <SelectValue placeholder="بدون بنك" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">بدون بنك</SelectItem>
                                                {banks && !banks.isLoading && banks.map((b: any) => (
                                                    <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">الوصف التفصيلي</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} placeholder="وصف كامل لمميزات العقار..." {...field} className="bg-slate-50 border-slate-200 focus:bg-white resize-y" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                            >
                                <Link to={cancelHref}>إلغاء</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || uploadingImage}
                                className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ العقار"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
