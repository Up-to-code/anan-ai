"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import type { UploadedFileReference } from "@/server/contracts/files";

function clampIndex(index: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return (index + total) % total;
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
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0] ?? null;
  const previewImages = images.slice(0, 5);
  const hasMultipleImages = images.length > 1;

  const goTo = (nextIndex: number) => {
    setActiveIndex(clampIndex(nextIndex, images.length));
  };

  if (!activeImage) {
    return (
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-background">
        <div className="mx-auto flex min-h-[42vh] w-full max-w-7xl flex-col items-center justify-center gap-3 px-6 py-10 text-center lg:px-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]">
            <Images className="h-6 w-6" />
          </span>
          <div className="text-[15px] font-black text-foreground">معرض الصور غير جاهز</div>
          <p className="max-w-md text-[13px] leading-6 text-muted-foreground">
            أضف صور المشروع ليبدأ العرض من الصور ثم ينتقل للبيانات والوحدات.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-background">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.9fr)] lg:px-8">
        <div className="relative min-w-0 overflow-hidden rounded-[28px] bg-[var(--workspace-elevated)]">
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="group relative block min-h-[34vh] w-full overflow-hidden text-right lg:min-h-[42vh]"
            aria-label="تغيير الصورة الرئيسية"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={`${activeImage.key}-${activeIndex}`}
                src={activeImage.url}
                alt={activeImage.name || title}
                className="absolute inset-0 h-full w-full object-cover"
                initial={false}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/14 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 sm:p-6">
              <div className="flex flex-wrap justify-end gap-2">
                {badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur-md">
                    {badge}
                  </span>
                ))}
              </div>
              <div className="flex items-end justify-between gap-4">
                <span className="rounded-full border border-white/20 bg-black/26 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur-md">
                  {activeIndex + 1} / {images.length}
                </span>
                <div className="max-w-3xl text-right text-white">
                  <div className="text-[11px] font-black text-white/70">صور المشروع</div>
                  <h2 className="mt-1 text-2xl font-black tracking-normal sm:text-3xl">{title}</h2>
                </div>
              </div>
            </div>
          </button>

          {hasMultipleImages ? (
            <div className="absolute inset-x-4 top-1/2 hidden -translate-y-1/2 justify-between md:flex">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50"
                aria-label="الصورة السابقة"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50"
                aria-label="الصورة التالية"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex min-h-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-black text-[var(--workspace-muted)]">{images.length} صور</span>
            <div className="text-[13px] font-black text-foreground">معاينة سريعة</div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-2">
            {previewImages.map((image, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={`${image.key}-${index}`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`group relative aspect-[0.95] overflow-hidden rounded-[22px] bg-[var(--workspace-elevated)] text-right transition ${
                    isActive ? "ring-2 ring-white/70 ring-offset-0" : ""
                  }`}
                  aria-label={`عرض الصورة ${index + 1}`}
                >
                  <img
                    src={image.url}
                    alt={image.name || `${title} ${index + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/38 px-2 py-1 text-[10px] font-black text-white backdrop-blur-md">
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
