/**
 * Avoeline monogram mark (`public/brand/avoeline-mark.png`, transparent bg).
 * Default: black strokes. `inverted` / dark theme: white strokes via CSS filter.
 */
export function BrandMark({
  className = "",
  inverted = false,
}: {
  className?: string;
  /** Force light mark on dark panels (auth aside, dashboard rail). */
  inverted?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/avoeline-mark.png"
        alt=""
        className={`h-full w-auto max-w-none object-contain ${
          inverted
            ? "brightness-0 invert"
            : "[html[data-theme=dark]_&]:brightness-0 [html[data-theme=dark]_&]:invert"
        }`}
      />
    </span>
  );
}

export default BrandMark;
