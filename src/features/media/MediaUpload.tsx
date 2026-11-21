"use client";

import { useRef, useState, useTransition } from "react";
import { ImageUp, TriangleAlert } from "lucide-react";
import { compressImage } from "./compressImage";
import { uploadMedia } from "./uploadMedia.action";
import { isVideoUrl } from "./media.utils";
import {
  assetSpecHint,
  getUploadKindConfig,
  isLogoKind,
  isUploadKind,
  type UploadKind,
} from "@/src/features/files/uploadKinds";

interface MediaUploadProps {
  /** Typed upload kind (preferred). Provide `kind` or legacy `folder`. */
  kind?: UploadKind;
  /** @deprecated Prefer `kind`. Kept for vendor/organizer callers. */
  folder?: string;
  /** Called with the resulting URL after each successful upload. */
  onUploaded: (url: string) => void;
  /** Accept attribute; defaults to images (logos include SVG). */
  accept?: string;
  /** Allow selecting/uploading multiple files (fires onUploaded per file). */
  multiple?: boolean;
  /** Target bucket override; usually inferred from kind. */
  bucket?: string;
  /** Event scope for path + ownership. */
  eventId?: string;
  /** Optional current single-image URL to preview. */
  value?: string | null;
  /** Optional label shown in the dropzone. */
  label?: string;
  className?: string;
  /** Override the dropzone button styling (e.g. a small square tile). */
  buttonClassName?: string;
  /** Show recommended size line under the control. */
  showSpecHint?: boolean;
}

const DEFAULT_BUTTON =
  "relative flex h-28 w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed border-line-loud bg-canvas text-ink-soft transition hover:border-ink disabled:opacity-60";

function formatHardMax(bytes: number): string {
  if (bytes >= 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1)}MB`;
  return `${Math.round(bytes / 1024)}KB`;
}

export function MediaUpload({
  kind,
  folder,
  onUploaded,
  accept,
  multiple = false,
  bucket,
  eventId,
  value,
  label = "Upload",
  className = "",
  buttonClassName = DEFAULT_BUTTON,
  showSpecHint = true,
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);

  const resolvedKind: UploadKind | null = kind && isUploadKind(kind) ? kind : null;
  const hardMax = resolvedKind ? getUploadKindConfig(resolvedKind).hardMaxBytes : 12 * 1024 * 1024;
  const acceptAttr =
    accept ?? (resolvedKind && isLogoKind(resolvedKind) ? "image/*,.svg,image/svg+xml" : "image/*");
  const specHint = resolvedKind && showSpecHint ? assetSpecHint(resolvedKind) : "";

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setWarning(null);
    const tooBig = Array.from(files).find((f) => f.size > hardMax);
    if (tooBig) {
      setError(`"${tooBig.name}" is too large (max ${formatHardMax(hardMax)}).`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    startTransition(async () => {
      for (const raw of Array.from(files)) {
        if (raw.type.startsWith("video/")) {
          setError("Videos are links only. Paste a YouTube or Vimeo URL instead.");
          continue;
        }
        const isSvg = raw.type === "image/svg+xml" || /\.svg$/i.test(raw.name);
        const file = raw.type.startsWith("image/") && !isSvg ? await compressImage(raw) : raw;
        if (file.size > hardMax) {
          setError(`"${file.name}" is still too large (max ${formatHardMax(hardMax)}).`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        if (kind) fd.append("kind", kind);
        if (folder) fd.append("folder", folder);
        if (bucket) fd.append("bucket", bucket);
        if (eventId) fd.append("eventId", eventId);
        const res = await uploadMedia(fd);
        if (res.success) {
          if (!multiple) setPreview(res.url);
          onUploaded(res.url);
          if (res.warnings?.length) setWarning(res.warnings[0] ?? null);
        } else {
          setError(res.error);
        }
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-busy={isPending}
        aria-label={preview && !multiple ? `Replace ${label || "image"}` : undefined}
        className={buttonClassName}
      >
        {preview && !multiple ? (
          isVideoUrl(preview) ? (
            <video src={preview} muted className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )
        ) : (
          <>
            <ImageUp className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs font-medium">{isPending ? "Uploading…" : label}</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {specHint ? (
        <p className="mt-1.5 text-[11px] leading-snug text-ink-soft">{specHint}</p>
      ) : null}
      {error && (
        <p role="alert" className="mt-1 flex items-center gap-1.5 text-xs font-medium text-danger">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {!error && warning ? (
        <p className="mt-1 flex items-start gap-1.5 text-xs text-ink-soft">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {warning}
        </p>
      ) : null}
    </div>
  );
}
