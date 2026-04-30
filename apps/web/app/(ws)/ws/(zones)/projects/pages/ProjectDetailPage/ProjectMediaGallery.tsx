"use client";

import { useState } from "react";
import { ImageIcon, Images, X } from "lucide-react";
import type { UploadedFileReference } from "@/server/contracts/files";

function formatFileSize(size?: number) {
  if (!size) {
    return "غير محدد";
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectMediaGallery({
  images,
  title,
  badges = [],
}: {
  images: UploadedFileReference[];
  title: string;
  badges?: string[];
}) {
  const [selectedImage, setSelectedImage] = useState<UploadedFileReference | null>(null);

  if (images.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border/70 bg-[var(--workspace-elevated)] p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-background text-[var(--workspace-muted)]">
          <Images className="h-5 w-5" />
        </span>
        <div className="mt-3 text-[14px] font-black text-foreground">صور المشروع غير جاهزة</div>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-muted-foreground">
          أضف صور المشروع ليظهر معرض مصغر ومنظم داخل النظرة العامة.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4 text-right" data-slot="project-media-gallery">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap justify-end gap-2">
          {badges.slice(0, 3).map((badge) => (
            <span key={badge} className="rounded-full border border-border/70 bg-background px-3 py-1 text-[11px] font-bold text-muted-foreground">
              {badge}
            </span>
          ))}
        </div>
        <div>
          <div className="text-[12px] font-bold text-muted-foreground">صور المشروع</div>
          <h2 className="mt-1 text-[18px] font-black text-foreground">{title}</h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={`${image.key}-${index}`}
            type="button"
            onClick={() => setSelectedImage(image)}
            className="group grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-border/70 bg-[var(--workspace-elevated)] p-2 text-right transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,var(--workspace-border))] hover:bg-background/70"
            aria-label={`فتح صورة ${image.name || index + 1}`}
          >
            <div className="min-w-0">
              <div className="truncate text-[13px] font-black text-foreground" title={image.name}>
                {image.name || `صورة ${index + 1}`}
              </div>
              <div className="mt-1 flex flex-wrap justify-end gap-2 text-[11px] font-bold text-muted-foreground">
                <span>{formatFileSize(image.size)}</span>
                <span>{image.mime || "صورة"}</span>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
              <img
                src={image.url}
                alt={image.name || title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
              />
            </div>
          </button>
        ))}
      </div>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="تفاصيل صورة المشروع"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="text-right">
                <div className="text-[11px] font-bold text-muted-foreground">صورة المشروع</div>
                <h3 className="mt-1 max-w-[60vw] truncate text-[15px] font-black text-foreground" title={selectedImage.name}>
                  {selectedImage.name}
                </h3>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="flex max-h-[72vh] items-center justify-center bg-black">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name || title}
                  className="max-h-[72vh] w-full object-contain"
                />
              </div>
              <aside className="space-y-3 p-4 text-right">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--workspace-elevated)] text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-muted-foreground">الاسم</div>
                  <div className="mt-1 break-words text-[13px] font-black text-foreground">{selectedImage.name}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-muted-foreground">النوع</div>
                  <div className="mt-1 text-[13px] font-bold text-foreground">{selectedImage.mime || "غير محدد"}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-muted-foreground">الحجم</div>
                  <div className="mt-1 text-[13px] font-bold text-foreground">{formatFileSize(selectedImage.size)}</div>
                </div>
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-[12px] font-black text-background transition hover:opacity-90"
                >
                  فتح الصورة
                </a>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
