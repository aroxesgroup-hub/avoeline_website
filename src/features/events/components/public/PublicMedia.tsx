"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { VideoPreview } from "@/src/shared_components/ui/VideoPreview";
import { isVideoUrl } from "@/src/features/media/media.utils";
import type { PublicEventDto } from "@/src/features/events/types";
import { buildPublicMediaItems } from "./publicPage.logic";

function isAllowedPromoUrl(url: string): boolean {
  if (!url) return false;
  if (isVideoUrl(url)) return true;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    return (
      host === "youtube.com" ||
      host === "youtu.be" ||
      host === "vimeo.com" ||
      host.endsWith(".youtube.com") ||
      host.endsWith(".vimeo.com")
    );
  } catch {
    return false;
  }
}

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function vimeoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const id = u.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  } catch {
    return null;
  }
}

export function PublicMedia({ dto }: { dto: PublicEventDto }) {
  const items = buildPublicMediaItems(dto);
  const promo = dto.promoVideoUrl && isAllowedPromoUrl(dto.promoVideoUrl) ? dto.promoVideoUrl : "";
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && items.length) {
        setLightbox((i) => (i == null ? 0 : (i + 1) % items.length));
      }
      if (e.key === "ArrowLeft" && items.length) {
        setLightbox((i) => (i == null ? 0 : (i - 1 + items.length) % items.length));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, items.length]);

  const yt = promo ? youtubeEmbed(promo) : null;
  const vim = promo && !yt ? vimeoEmbed(promo) : null;

  // Gallery only — banner already shown in hero; avoid double-crop as a square thumb.
  const galleryItems = items.filter((i) => i.kind === "gallery");
  if (!galleryItems.length && !promo) return null;

  return (
    <section id="gallery" className="scroll-mt-24 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-[var(--mkt-ink)]">
            Event atmosphere &amp; past highlights
          </h2>
          {galleryItems.length ? (
            <p className="mt-1 text-xs text-[var(--mkt-muted)]">
              {galleryItems.length} photo{galleryItems.length === 1 ? "" : "s"} · Recommended
              1200×800 (3:2) WebP under 800KB
            </p>
          ) : null}
        </div>
      </div>

      {promo ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-surface-low)]">
          {isVideoUrl(promo) ? (
            <VideoPreview src={promo} title={dto.title} className="w-full">
              <video src={promo} muted className="aspect-video w-full object-contain" />
            </VideoPreview>
          ) : yt || vim ? (
            <iframe
              title={`${dto.title} promo`}
              src={(yt || vim)!}
              loading="lazy"
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <a
              href={promo}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-6 text-sm font-medium text-[var(--mkt-ink)] underline"
            >
              Watch promo video
            </a>
          )}
        </div>
      ) : null}

      {galleryItems.length ? (
        <ul className="columns-2 gap-3 sm:columns-3">
          {galleryItems.map((item, index) => {
            const fullIndex = items.findIndex((x) => x.src === item.src);
            const tall = index % 5 === 1 || index % 5 === 4;
            return (
              <li key={`${item.kind}-${item.src}`} className="mb-3 break-inside-avoid">
                <button
                  type="button"
                  className={`relative block w-full overflow-hidden rounded-xl bg-[var(--mkt-surface-low)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mkt-accent)] ${
                    tall ? "aspect-[3/4]" : "aspect-[4/3]"
                  }`}
                  onClick={() => setLightbox(fullIndex >= 0 ? fullIndex : index)}
                  aria-label={`Open image ${index + 1}`}
                >
                  <Image
                    src={item.src}
                    alt={`${dto.title} gallery`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-contain object-center p-1"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {lightbox != null && items[lightbox] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mkt-ink)]/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-lg border border-white/30 bg-black/50 px-3 py-1.5 text-sm text-white"
            onClick={() => setLightbox(null)}
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={items[lightbox].src}
            alt=""
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}
