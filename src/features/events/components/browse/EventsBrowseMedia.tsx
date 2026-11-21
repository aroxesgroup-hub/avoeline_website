import Image from "next/image";

/** Landscape event media — 16:10, no portrait crop; gradient fallback when missing. */
export function EventsBrowseMedia({
  title,
  imageUrl,
  category,
  className = "",
  priority = false,
}: {
  title: string;
  imageUrl?: string | null;
  category?: string | null;
  className?: string;
  priority?: boolean;
}) {
  const seed = `${category || ""}:${title}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const hues = [
    ["#064e3b", "#0f766e"],
    ["#134e4a", "#14b8a6"],
    ["#1e3a5f", "#0d9488"],
    ["#14532d", "#059669"],
  ];
  const [a, b] = hues[Math.abs(hash) % hues.length]!;
  const gradient = `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;

  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden bg-[var(--mkt-surface)] ${className}`}
      style={imageUrl ? undefined : { backgroundImage: gradient }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-end p-4">
          <span className="text-sm font-semibold text-white/90 line-clamp-2">{title}</span>
        </div>
      )}
    </div>
  );
}
