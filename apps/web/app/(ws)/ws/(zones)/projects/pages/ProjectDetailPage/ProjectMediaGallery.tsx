"use client";

import { useRef, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
}: {
  images: UploadedFileReference[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const activeImage = images[activeIndex] ?? images[0] ?? null;
  const hasMultipleImages = images.length > 1;

  const goTo = (nextIndex: number) => {
    setActiveIndex(clampIndex(nextIndex, images.length));
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    touchStartXRef.current = null;

    if (startX === null || endX === null) {
      return;
    }

    const delta = startX - endX;
    if (Math.abs(delta) < 40) {
      return;
    }

    goTo(activeIndex + (delta > 0 ? 1 : -1));
  };

  if (!activeImage) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-stone-200 bg-stone-950">
      <div
        className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={activeImage.url}
          alt={activeImage.name || title}
          className="h-full w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition hover:bg-black/60"
              aria-label="الصورة السابقة"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition hover:bg-black/60"
              aria-label="الصورة التالية"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}

        <div className="absolute bottom-4 right-4 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {hasMultipleImages ? (
        <div className="border-t border-white/10 bg-stone-950/95 p-4">
          <div className="hidden gap-3 sm:grid sm:grid-cols-4 lg:grid-cols-5">
            {images.map((image, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={`${image.key}-${index}`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`overflow-hidden rounded-2xl border transition ${
                    isActive
                      ? "border-amber-300/80 ring-1 ring-amber-300/60"
                      : "border-white/10 opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`الانتقال إلى الصورة ${index + 1}`}
                >
                  <img
                    src={image.url}
                    alt={image.name || `${title} ${index + 1}`}
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-center gap-2 sm:hidden">
            {images.map((image, index) => (
              <button
                key={`${image.key}-dot-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`الانتقال إلى الصورة ${index + 1}`}
                className={`h-2.5 rounded-full transition ${
                  index === activeIndex ? "w-8 bg-amber-300" : "w-2.5 bg-white/35"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
