import { ASSET_SPEC } from "@/src/features/files/uploadKinds";

/** Compact media-spec callout under hero (organizer guidance mirrored for visitors). */
export function PublicMediaGuidelineStrip() {
  return (
    <div className="border-b border-[var(--mkt-line)] bg-[var(--mkt-accent-tint)]/70">
      <div className="mx-auto flex w-full max-w-[var(--mkt-max,80rem)] flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mkt-accent-deep)]">
            Organizer Media & Asset specification guide
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--mkt-text)] sm:text-sm">
            Banner {ASSET_SPEC.event_banner.recommended} ({ASSET_SPEC.event_banner.formats},{" "}
            {ASSET_SPEC.event_banner.maxLabel}). Gallery {ASSET_SPEC.event_gallery.recommended},{" "}
            {ASSET_SPEC.event_gallery.maxLabel}. Logos {ASSET_SPEC.sponsor_logo.recommended}, SVG /
            PNG.
          </p>
        </div>
      </div>
    </div>
  );
}
