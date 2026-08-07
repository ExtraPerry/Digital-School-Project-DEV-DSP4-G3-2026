"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BoatImage } from "@/lib/boats";
import { cn } from "@/lib/utils";

export type BoatGalleryImage = BoatImage & {
  /** Resolved once by the page: owner alt text, else a label keyed on `kind`. */
  alt: string;
};

/**
 * Listing photography, browsable.
 *
 * The page used to render the cover plus a strip of decorative thumbnails, so a
 * visitor could see that four photos existed but could only ever look at one of
 * them. Every shot is now reachable: the thumbnails select the main image, and
 * any of them opens a full-size viewer with previous/next controls, arrow-key
 * navigation and a position counter.
 */
export function BoatGallery({
  images,
  badgeLabel,
}: {
  images: BoatGalleryImage[];
  badgeLabel?: string | null;
}) {
  const t = useTranslations("Pages.BoatPage");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div
        aria-label={t("gallery_empty")}
        className="h-72 rounded-2xl bg-neutral-200 md:h-96"
        role="img"
      />
    );
  }

  //? Guards against an index left over from a shorter gallery when the page
  //? re-renders with new data.
  const currentIndex = Math.min(activeIndex, images.length - 1);
  const currentImage = images[currentIndex];
  const hasSeveral = images.length > 1;

  function step(offset: number) {
    setActiveIndex(
      (index) => (index + offset + images.length) % images.length,
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-72 overflow-hidden rounded-2xl bg-neutral-200 md:h-96">
        <Image
          alt={currentImage.alt}
          className="object-cover"
          fill
          //? The main shot is the page's LCP element whichever one is selected.
          priority
          sizes="(min-width: 1024px) 736px, calc(100vw - 3rem)"
          src={currentImage.url}
          style={{ objectPosition: currentImage.focalPoint }}
        />

        {badgeLabel ? (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#1a2b48] shadow-sm backdrop-blur-sm">
            {badgeLabel}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/45 to-transparent p-3">
          {hasSeveral ? (
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              {t("gallery_position", {
                index: currentIndex + 1,
                total: images.length,
              })}
            </span>
          ) : (
            <span />
          )}
          <Button
            className="gap-1.5 rounded-full bg-white/95 text-[#1a2b48] hover:bg-white"
            onClick={() => setIsViewerOpen(true)}
            size="sm"
            type="button"
          >
            <Expand aria-hidden className="size-3.5" />
            {t("gallery_open")}
          </Button>
        </div>

        {hasSeveral ? (
          <>
            <GalleryArrow
              className="left-2"
              direction="previous"
              label={t("gallery_previous")}
              onClick={() => step(-1)}
            />
            <GalleryArrow
              className="right-2"
              direction="next"
              label={t("gallery_next")}
              onClick={() => step(1)}
            />
          </>
        ) : null}
      </div>

      {hasSeveral ? (
        <ul className="grid grid-cols-4 gap-2 sm:gap-3">
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                aria-current={index === currentIndex}
                aria-label={t("gallery_show_image", {
                  index: index + 1,
                  total: images.length,
                })}
                className={cn(
                  "relative block h-16 w-full overflow-hidden rounded-xl bg-neutral-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D68A6E] focus-visible:ring-offset-2 sm:h-20 md:h-24",
                  index === currentIndex
                    ? "ring-2 ring-[#D68A6E] ring-offset-2"
                    : "opacity-80 hover:opacity-100",
                )}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <Image
                  alt={image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 180px, 24vw"
                  src={image.url}
                  style={{ objectPosition: image.focalPoint }}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog onOpenChange={setIsViewerOpen} open={isViewerOpen}>
        <DialogContent
          //? The shared close button inherits the light theme's foreground, so
          //? it has to be re-coloured against this dark viewer.
          className="max-w-[calc(100vw-1.5rem)] gap-3 bg-[#101a2b] p-3 text-white ring-white/10 sm:max-w-4xl [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:hover:bg-white/15"
          onKeyDown={(event) => {
            if (!hasSeveral) return;

            if (event.key === "ArrowLeft") {
              event.preventDefault();
              step(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              step(1);
            }
          }}
        >
          <DialogHeader className="pr-10">
            <DialogTitle className="text-sm font-medium text-white">
              {t("gallery_viewer_title")}
            </DialogTitle>
            <DialogDescription className="text-xs text-white/70">
              {currentImage.alt}
            </DialogDescription>
          </DialogHeader>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black/40">
            <Image
              alt={currentImage.alt}
              className="object-contain"
              fill
              sizes="(min-width: 640px) 896px, 100vw"
              src={currentImage.url}
            />

            {hasSeveral ? (
              <>
                <GalleryArrow
                  className="left-2"
                  direction="previous"
                  label={t("gallery_previous")}
                  onClick={() => step(-1)}
                />
                <GalleryArrow
                  className="right-2"
                  direction="next"
                  label={t("gallery_next")}
                  onClick={() => step(1)}
                />
              </>
            ) : null}
          </div>

          {hasSeveral ? (
            <p className="text-center text-xs text-white/70">
              {t("gallery_position", {
                index: currentIndex + 1,
                total: images.length,
              })}
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GalleryArrow({
  className,
  direction,
  label,
  onClick,
}: {
  className?: string;
  direction: "previous" | "next";
  label: string;
  onClick: () => void;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;

  return (
    <button
      aria-label={label}
      className={cn(
        "absolute top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1a2b48] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D68A6E] focus-visible:ring-offset-2",
        className,
      )}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}
