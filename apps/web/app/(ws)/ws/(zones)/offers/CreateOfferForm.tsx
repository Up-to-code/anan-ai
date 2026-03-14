"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";

type PropertyOption = {
  id: string;
  title: string;
  location: string;
  image: string;
  expectedPrice: string;
};

type CreateOfferFormProps = {
  properties: PropertyOption[];
  onSubmit: (data: {
    propertyId: string;
    title: string;
    description: string;
    price: string;
    visibility: "public" | "private";
    attachments: UploadedFileReference[];
  }) => Promise<{ redirectTo: string }>;
};

export default function CreateOfferForm({ properties, onSubmit }: CreateOfferFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [attachments, setAttachments] = useState<UploadedFileReference[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    propertyId: string;
    title: string;
    description: string;
    price: string;
    visibility: "public" | "private";
  }>({
    propertyId: properties[0]?.id ?? "",
    title: "",
    description: "",
    price: properties[0]?.expectedPrice ?? "",
    visibility: "public",
  });
  const { startUpload, isUploading } = useUploadThing("offerAttachments");

  const selectedProperty = properties.find((property) => property.id === form.propertyId) ?? null;

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setError(null);

    try {
      const uploaded = await startUpload(files);
      const nextAttachments = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setAttachments((current) => [...current, ...nextAttachments]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "تعذر رفع الملفات.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="mx-auto grid w-full max-w-4xl gap-8 px-6 py-6 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between border border-slate-200 bg-white p-4">
          <div>
            <h1 className="text-xl font-black text-slate-950">إنشاء عرض جديد</h1>
            <p className="mt-1 text-xs font-bold text-slate-500">اختر عقاراً من محفظتك ثم ارفع المرفقات عبر UploadThing.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/ws/offers")}
            className="flex items-center gap-2 border border-slate-200 px-4 py-3 text-xs font-black text-slate-700 transition hover:border-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة
          </button>
        </div>

        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            startTransition(async () => {
              const result = await onSubmit({
                ...form,
                attachments,
              });
              router.push(result.redirectTo);
            });
          }}
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6">
              <section className="border border-slate-200 bg-white p-6">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">العقار المرتبط</label>
                <select
                  value={form.propertyId}
                  onChange={(event) => {
                    const property = properties.find((item) => item.id === event.target.value);
                    setForm((current) => ({
                      ...current,
                      propertyId: event.target.value,
                      price: property?.expectedPrice ?? current.price,
                    }));
                  }}
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900"
                >
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.location}
                    </option>
                  ))}
                </select>
              </section>

              <section className="border border-slate-200 bg-white p-6">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">عنوان العرض</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full border-b-2 border-slate-200 bg-transparent py-3 text-lg font-black text-slate-950 outline-none"
                />
                <label className="mb-2 mt-6 block text-[10px] font-black uppercase tracking-widest text-slate-400">الوصف</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                />
              </section>
            </div>

            <div className="grid gap-6">
              {selectedProperty ? (
                <section className="overflow-hidden border border-slate-200 bg-white">
                  <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${selectedProperty.image})` }} />
                  <div className="p-5">
                    <div className="text-lg font-black text-slate-950">{selectedProperty.title}</div>
                    <div className="mt-1 text-xs font-bold text-slate-500">{selectedProperty.location}</div>
                  </div>
                </section>
              ) : null}

              <section className="border border-slate-200 bg-white p-6">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">السعر</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900"
                />
                <label className="mb-2 mt-6 block text-[10px] font-black uppercase tracking-widest text-slate-400">الظهور</label>
                <select
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, visibility: event.target.value as "public" | "private" }))
                  }
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900"
                >
                  <option value="public">عام</option>
                  <option value="private">خاص</option>
                </select>
              </section>

              <section className="border border-slate-200 bg-white p-6">
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFiles} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm font-black text-slate-900"
                >
                  <Upload className="h-5 w-5" />
                  {isUploading ? "جارٍ رفع الملفات..." : "إرفاق ملفات عبر UploadThing"}
                </button>
                <div className="mt-4 grid gap-2">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.key}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
                    >
                      {attachment.name}
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {error ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={pending}
            className="bg-blue-600 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-950"
          >
            {pending ? "جارٍ الحفظ..." : "حفظ العرض"}
          </button>
        </form>
      </div>
    </div>
  );
}
