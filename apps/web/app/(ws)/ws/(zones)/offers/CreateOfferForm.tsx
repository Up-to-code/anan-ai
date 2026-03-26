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
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-foreground">إنشاء عرض جديد</h1>
            <p className="mt-1 text-[13px] font-medium text-muted-foreground">اختر عقاراً من محفظتك ثم ارفع المرفقات عبر UploadThing.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/ws/offers")}
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
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
              try {
                const result = await onSubmit({
                  ...form,
                  attachments,
                });
                router.push(result.redirectTo);
              } catch (submitError) {
                setError(
                  submitError instanceof Error ? submitError.message : "تعذر حفظ العرض. حاول مرة أخرى.",
                );
              }
            });
          }}
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6">
              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">العقار المرتبط</label>
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                >
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.location}
                    </option>
                  ))}
                </select>
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">عنوان العرض</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full border-b-2 border-border bg-transparent py-3 text-lg font-black text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                />
                <label className="mb-2 mt-6 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">الوصف</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-medium text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </section>
            </div>

            <div className="grid gap-6">
              {selectedProperty ? (
                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="h-44 bg-cover bg-center transition-transform duration-500 hover:scale-105" style={{ backgroundImage: `url(${selectedProperty.image})` }} />
                  <div className="relative bg-card p-5">
                    <div className="text-[14px] font-bold text-foreground">{selectedProperty.title}</div>
                    <div className="mt-1 text-[12px] font-bold text-muted-foreground">{selectedProperty.location}</div>
                  </div>
                </section>
              ) : null}

              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">السعر</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                />
                <label className="mb-2 mt-6 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">الظهور</label>
                <select
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, visibility: event.target.value as "public" | "private" }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                >
                  <option value="public">عام</option>
                  <option value="private">خاص</option>
                </select>
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFiles} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 px-4 py-8 text-[13px] font-bold text-muted-foreground transition hover:border-border hover:bg-muted/40 hover:text-foreground"
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
                      className="rounded-xl border border-border bg-background px-3 py-2 text-[12px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground shadow-sm"
                    >
                      {attachment.name}
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] font-bold text-destructive">{error}</div> : null}

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-foreground px-6 py-4 text-[13px] font-black uppercase tracking-[0.2em] text-background shadow-sm transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "جارٍ الحفظ..." : "حفظ العرض"}
          </button>
        </form>
      </div>
    </div>
  );
}
