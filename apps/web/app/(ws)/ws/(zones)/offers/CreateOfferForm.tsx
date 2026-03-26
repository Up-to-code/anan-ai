"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
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
    <div className="flex min-h-full flex-col pb-24 bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 lg:px-10 lg:py-16">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xl shadow-black/[0.02]">
          <div className="space-y-1 text-right">
            <h1 className="text-2xl font-black tracking-tight text-foreground">إنشاء عرض جديد</h1>
            <p className="text-[14px] font-medium text-muted-foreground">قم بتخصيص عرضك العقاري ورفعه للمنصة بخطوات بسيطة.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/ws/offers")}
            className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-muted/10 px-6 py-3.5 text-[13px] font-black uppercase tracking-[0.2em] text-foreground transition-all hover:bg-muted active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            العودة
          </button>
        </header>

        <form
          className="grid gap-10"
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
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-10">
              <section className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-xl shadow-black/[0.02]">
                <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">العقار المرتبط</label>
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
                  className="w-full rounded-2xl border border-border/40 bg-muted/10 px-5 py-4 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20 appearance-none"
                >
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.location}
                    </option>
                  ))}
                </select>
              </section>

              <section className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-xl shadow-black/[0.02]">
                <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">عنوان العرض</label>
                <input
                  type="text"
                  placeholder="مثال: عرض حصري لأبراج الياسمين"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-2xl border border-border/40 bg-muted/10 px-5 py-4 text-xl font-black tracking-tight text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                />
                
                <div className="mt-8">
                  <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">الوصف</label>
                  <textarea
                    rows={6}
                    placeholder="اكتب تفاصيل العرض المميزة..."
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    className="w-full rounded-2xl border border-border/40 bg-muted/10 px-5 py-4 text-[15px] font-medium leading-[1.6] text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20 resize-none"
                  />
                </div>
              </section>
            </div>

            <div className="space-y-10">
              {selectedProperty ? (
                <section className="group overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/[0.02] transition-all hover:border-foreground/20">
                  <div className="relative h-56 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedProperty.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 right-6 text-right">
                      <div className="truncate text-xl font-black tracking-tight text-white">{selectedProperty.title}</div>
                      <div className="mt-1 text-[13px] font-bold text-white/70">{selectedProperty.location}</div>
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-xl shadow-black/[0.02]">
                <div className="space-y-8">
                  <div>
                    <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">السعر المعروض</label>
                    <input
                      type="text"
                      value={form.price}
                      onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                      className="w-full rounded-2xl border border-border/40 bg-muted/10 px-5 py-4 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">ظهور العرض</label>
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/20 p-1.5 border border-border/40">
                      {(["public", "private"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, visibility: mode }))}
                          className={cn(
                            "rounded-xl py-3 text-[11px] font-black uppercase tracking-widest transition-all",
                            form.visibility === mode
                              ? "bg-foreground text-background shadow-md"
                              : "text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          {mode === "public" ? "عام" : "خاص"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-xl shadow-black/[0.02]">
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFiles} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border/60 bg-muted/10 py-10 transition-all hover:bg-muted/20 hover:border-foreground/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm border border-border/40 text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-all">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-[13px] font-black text-foreground">
                      {isUploading ? "جارٍ الرفع..." : "إرفاق مستندات العرض"}
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      UploadThing Secure Storage
                    </div>
                  </div>
                </button>
                {attachments.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {attachments.map((attachment) => (
                      <a
                        key={attachment.key}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/10 px-4 py-3 text-[13px] font-bold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                      >
                        <span className="truncate">{attachment.name}</span>
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-4 text-[13px] font-bold text-rose-600">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end pt-4">
            <button
              type="submit"
              disabled={pending}
              className="w-full md:w-auto min-w-[240px] rounded-3xl bg-foreground px-10 py-5 text-[15px] font-black uppercase tracking-[0.2em] text-background shadow-2xl shadow-black/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {pending ? "جارٍ الحفظ..." : "حفظ ونشر العرض"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
