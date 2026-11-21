import { formatAssetGuideSummary, ASSET_SPEC } from "@/src/features/files/uploadKinds";

/** Compact organizer callout for banner / gallery / logo / avatar specs. */
export function AssetSpecGuide({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <p
        className={`rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 text-xs leading-relaxed text-emerald-950 ${className}`}
      >
        <span className="font-semibold">Media specs: </span>
        {formatAssetGuideSummary()}
      </p>
    );
  }

  return (
    <aside
      className={`rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800/80">
            Organizer Media & Asset specification guide
          </p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-950/90">
            Ensure your event banner looks high-quality. Recommended: Banner (
            {ASSET_SPEC.event_banner.recommended}, {ASSET_SPEC.event_banner.formats},{" "}
            {ASSET_SPEC.event_banner.maxLabel}), Gallery ({ASSET_SPEC.event_gallery.recommended},{" "}
            {ASSET_SPEC.event_gallery.maxLabel}), and Logos ({ASSET_SPEC.sponsor_logo.recommended},
            SVG / PNG).
          </p>
        </div>
      </div>
      <ul className="mt-3 grid gap-2 text-xs text-emerald-900/90 sm:grid-cols-2">
        <li>
          <span className="font-semibold">Banner:</span> {ASSET_SPEC.event_banner.aspect} ·{" "}
          {ASSET_SPEC.event_banner.maxLabel}
        </li>
        <li>
          <span className="font-semibold">Gallery:</span> {ASSET_SPEC.event_gallery.aspect} ·{" "}
          {ASSET_SPEC.event_gallery.maxLabel}
        </li>
        <li>
          <span className="font-semibold">Logos:</span> {ASSET_SPEC.sponsor_logo.aspect} ·{" "}
          {ASSET_SPEC.sponsor_logo.maxLabel}
        </li>
        <li>
          <span className="font-semibold">Avatars:</span> {ASSET_SPEC.speaker_photo.recommended} ·{" "}
          {ASSET_SPEC.speaker_photo.maxLabel}
        </li>
      </ul>
    </aside>
  );
}
