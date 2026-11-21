/**
 * Typed upload allowlist (docs/23 N1 / A8 + 2026-11-21 landscape media matrix).
 * Public display images → Supabase media (compressed). Private → FileStore.
 */

export const UPLOAD_KINDS = [
  "event_banner",
  "event_gallery",
  "sponsor_logo",
  "collaborator_logo",
  "partner_logo",
  "speaker_photo",
  "competition_image",
  "payment_proof",
  "submission_file",
  "task_attachment",
  "certificate_asset",
  "certificate_archive",
  "export_file",
] as const;

export type UploadKind = (typeof UPLOAD_KINDS)[number];

export type UploadStore = "supabase_public" | "filestore" | "filestore_fallback";

export type UploadActor = "organizer" | "public_registrant" | "participant";

export type UploadKindConfig = {
  kind: UploadKind;
  store: UploadStore;
  /** Primary bucket for supabase_public (media or sponsor-logos). */
  bucket: "media" | "sponsor-logos";
  folder: string;
  mimeAllow: readonly string[] | "image" | "image_or_pdf" | "image_or_svg" | "documents";
  /** Soft target after compression (bytes). */
  maxBytes: number;
  /** Hard reject before processing. */
  hardMaxBytes: number;
  maxDimension?: number;
  /** Target encoded size budget. */
  budgetBytes?: number;
  who: readonly UploadActor[];
  /** Videos must be links only for these public kinds. */
  rejectVideo: boolean;
};

const IMAGE_PREFIX = "image/" as const;

/** Post-process WebP budgets (landscape media matrix). */
export const MEDIA_BUDGETS = {
  event_banner: 800 * 1024,
  event_gallery: 800 * 1024,
  logo: 150 * 1024,
  speaker_photo: 300 * 1024,
  competition_image: 800 * 1024,
} as const;

/** Ingress hard caps before processing. */
export const MEDIA_HARD_MAX = {
  event_banner: 2 * 1024 * 1024,
  event_gallery: 800 * 1024,
  logo: 150 * 1024,
  speaker_photo: 300 * 1024,
  competition_image: 800 * 1024,
  /** Legacy default for other public rasters. */
  default: 12 * 1024 * 1024,
} as const;

export type AssetSpecGuide = {
  kind: UploadKind;
  title: string;
  recommended: string;
  aspect: string;
  formats: string;
  maxLabel: string;
  hint: string;
};

/** Organizer-facing + public guideline copy. */
export const ASSET_SPEC: Record<
  | "event_banner"
  | "event_gallery"
  | "sponsor_logo"
  | "collaborator_logo"
  | "partner_logo"
  | "speaker_photo"
  | "competition_image",
  AssetSpecGuide
> = {
  event_banner: {
    kind: "event_banner",
    title: "Event Hero Banner",
    recommended: "1920 × 1080 px (or 2400 × 1000 panoramic)",
    aspect: "16:9 or 2.4:1",
    formats: "WebP (primary), JPG / PNG",
    maxLabel: "< 2.0 MB (ideally < 800 KB)",
    hint: "Keep the focal subject centered for mobile crop.",
  },
  event_gallery: {
    kind: "event_gallery",
    title: "Gallery Images",
    recommended: "1200 × 800 px or 1600 × 900 px",
    aspect: "3:2 or 16:9",
    formats: "WebP, JPG (sRGB)",
    maxLabel: "< 800 KB per image",
    hint: "Past highlights, venue, mentor pods, stage shots.",
  },
  sponsor_logo: {
    kind: "sponsor_logo",
    title: "Sponsor Logo",
    recommended: "400 × 400 px or 400 × 200 px",
    aspect: "1:1 or 2:1",
    formats: "SVG or transparent PNG",
    maxLabel: "< 150 KB",
    hint: "Crisp on sponsor matrices and badges.",
  },
  collaborator_logo: {
    kind: "collaborator_logo",
    title: "Collaborator Logo",
    recommended: "400 × 400 px or 400 × 200 px",
    aspect: "1:1 or 2:1",
    formats: "SVG or transparent PNG",
    maxLabel: "< 150 KB",
    hint: "Transparent background preferred.",
  },
  partner_logo: {
    kind: "partner_logo",
    title: "Partner Logo",
    recommended: "400 × 400 px or 400 × 200 px",
    aspect: "1:1 or 2:1",
    formats: "SVG or transparent PNG",
    maxLabel: "< 150 KB",
    hint: "Transparent background preferred.",
  },
  speaker_photo: {
    kind: "speaker_photo",
    title: "Speaker / Judge Avatar",
    recommended: "400 × 400 px",
    aspect: "1:1",
    formats: "WebP, JPG, PNG",
    maxLabel: "< 300 KB",
    hint: "Shown in circular badges.",
  },
  competition_image: {
    kind: "competition_image",
    title: "Track / Competition Image",
    recommended: "1600 × 900 px",
    aspect: "16:9",
    formats: "WebP, JPG / PNG",
    maxLabel: "< 800 KB",
    hint: "Landscape card art for the multi-track panel.",
  },
};

export const LOGO_KINDS = ["sponsor_logo", "collaborator_logo", "partner_logo"] as const;

export function isLogoKind(kind: UploadKind): boolean {
  return (LOGO_KINDS as readonly string[]).includes(kind);
}

export function assetSpecForKind(kind: UploadKind): AssetSpecGuide | null {
  if (kind in ASSET_SPEC) return ASSET_SPEC[kind as keyof typeof ASSET_SPEC];
  return null;
}

/** Short one-line hint for upload fields. */
export function assetSpecHint(kind: UploadKind): string {
  const spec = assetSpecForKind(kind);
  if (!spec) return "";
  return `${spec.recommended} · ${spec.aspect} · ${spec.formats} · ${spec.maxLabel}`;
}

export function formatAssetGuideSummary(): string {
  return [
    `Banner: ${ASSET_SPEC.event_banner.recommended}, ${ASSET_SPEC.event_banner.formats}, ${ASSET_SPEC.event_banner.maxLabel}.`,
    `Gallery: ${ASSET_SPEC.event_gallery.recommended}, ${ASSET_SPEC.event_gallery.maxLabel}.`,
    `Logos: ${ASSET_SPEC.sponsor_logo.recommended}, SVG/PNG, ${ASSET_SPEC.sponsor_logo.maxLabel}.`,
    `Avatars: ${ASSET_SPEC.speaker_photo.recommended}, ${ASSET_SPEC.speaker_photo.maxLabel}.`,
  ].join(" ");
}

const PUBLIC_IMAGE_BASE: Pick<
  UploadKindConfig,
  "store" | "bucket" | "mimeAllow" | "rejectVideo" | "who" | "maxDimension"
> = {
  store: "supabase_public",
  bucket: "media",
  mimeAllow: "image",
  rejectVideo: true,
  who: ["organizer"],
  maxDimension: 2400,
};

export const UPLOAD_KIND_CONFIG: Record<UploadKind, UploadKindConfig> = {
  event_banner: {
    ...PUBLIC_IMAGE_BASE,
    kind: "event_banner",
    folder: "banners",
    hardMaxBytes: MEDIA_HARD_MAX.event_banner,
    maxBytes: MEDIA_BUDGETS.event_banner,
    budgetBytes: MEDIA_BUDGETS.event_banner,
  },
  event_gallery: {
    ...PUBLIC_IMAGE_BASE,
    kind: "event_gallery",
    folder: "galleries",
    hardMaxBytes: MEDIA_HARD_MAX.event_gallery,
    maxBytes: MEDIA_BUDGETS.event_gallery,
    budgetBytes: MEDIA_BUDGETS.event_gallery,
  },
  sponsor_logo: {
    ...PUBLIC_IMAGE_BASE,
    kind: "sponsor_logo",
    bucket: "sponsor-logos",
    folder: "sponsors",
    mimeAllow: "image_or_svg",
    hardMaxBytes: MEDIA_HARD_MAX.logo,
    maxBytes: MEDIA_BUDGETS.logo,
    budgetBytes: MEDIA_BUDGETS.logo,
  },
  collaborator_logo: {
    ...PUBLIC_IMAGE_BASE,
    kind: "collaborator_logo",
    bucket: "sponsor-logos",
    folder: "collaborators",
    mimeAllow: "image_or_svg",
    hardMaxBytes: MEDIA_HARD_MAX.logo,
    maxBytes: MEDIA_BUDGETS.logo,
    budgetBytes: MEDIA_BUDGETS.logo,
  },
  partner_logo: {
    ...PUBLIC_IMAGE_BASE,
    kind: "partner_logo",
    bucket: "sponsor-logos",
    folder: "partners",
    mimeAllow: "image_or_svg",
    hardMaxBytes: MEDIA_HARD_MAX.logo,
    maxBytes: MEDIA_BUDGETS.logo,
    budgetBytes: MEDIA_BUDGETS.logo,
  },
  speaker_photo: {
    ...PUBLIC_IMAGE_BASE,
    kind: "speaker_photo",
    folder: "speakers",
    hardMaxBytes: MEDIA_HARD_MAX.speaker_photo,
    maxBytes: MEDIA_BUDGETS.speaker_photo,
    budgetBytes: MEDIA_BUDGETS.speaker_photo,
  },
  competition_image: {
    ...PUBLIC_IMAGE_BASE,
    kind: "competition_image",
    folder: "competitions",
    hardMaxBytes: MEDIA_HARD_MAX.competition_image,
    maxBytes: MEDIA_BUDGETS.competition_image,
    budgetBytes: MEDIA_BUDGETS.competition_image,
  },
  payment_proof: {
    kind: "payment_proof",
    store: "filestore",
    bucket: "media",
    folder: "payment_proofs",
    mimeAllow: "image_or_pdf",
    maxBytes: 5 * 1024 * 1024,
    hardMaxBytes: 8 * 1024 * 1024,
    maxDimension: 4096,
    who: ["public_registrant"],
    rejectVideo: true,
  },
  submission_file: {
    kind: "submission_file",
    store: "filestore",
    bucket: "media",
    folder: "submissions",
    mimeAllow: "documents",
    maxBytes: 50 * 1024 * 1024,
    hardMaxBytes: 50 * 1024 * 1024,
    who: ["participant", "organizer"],
    rejectVideo: false,
  },
  task_attachment: {
    kind: "task_attachment",
    store: "filestore",
    bucket: "media",
    folder: "submissions",
    mimeAllow: "documents",
    maxBytes: 50 * 1024 * 1024,
    hardMaxBytes: 50 * 1024 * 1024,
    who: ["organizer", "participant"],
    rejectVideo: false,
  },
  certificate_asset: {
    kind: "certificate_asset",
    store: "supabase_public",
    bucket: "media",
    folder: "certificates",
    mimeAllow: "image",
    maxBytes: 2 * 1024 * 1024,
    hardMaxBytes: 8 * 1024 * 1024,
    who: ["organizer"],
    rejectVideo: true,
  },
  certificate_archive: {
    kind: "certificate_archive",
    store: "filestore",
    bucket: "media",
    folder: "certificates",
    mimeAllow: "documents",
    maxBytes: 50 * 1024 * 1024,
    hardMaxBytes: 50 * 1024 * 1024,
    who: ["organizer"],
    rejectVideo: false,
  },
  export_file: {
    kind: "export_file",
    store: "filestore",
    bucket: "media",
    folder: "exports",
    mimeAllow: "documents",
    maxBytes: 50 * 1024 * 1024,
    hardMaxBytes: 50 * 1024 * 1024,
    who: ["organizer"],
    rejectVideo: false,
  },
};

export function isUploadKind(value: string): value is UploadKind {
  return (UPLOAD_KINDS as readonly string[]).includes(value);
}

export function getUploadKindConfig(kind: UploadKind): UploadKindConfig {
  return UPLOAD_KIND_CONFIG[kind];
}

export function mimeAllowedForKind(kind: UploadKind, mime: string): boolean {
  const cfg = UPLOAD_KIND_CONFIG[kind];
  const m = mime.toLowerCase().split(";")[0]!.trim();
  if (cfg.rejectVideo && m.startsWith("video/")) return false;
  if (cfg.mimeAllow === "image") return m.startsWith(IMAGE_PREFIX) && m !== "image/svg+xml";
  if (cfg.mimeAllow === "image_or_svg") {
    return m.startsWith(IMAGE_PREFIX); // includes SVG
  }
  if (cfg.mimeAllow === "image_or_pdf") {
    return (m.startsWith(IMAGE_PREFIX) && m !== "image/svg+xml") || m === "application/pdf";
  }
  if (m.startsWith("image/") && m !== "image/svg+xml") return true;
  if (m.startsWith("video/")) return !cfg.rejectVideo;
  return [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
    "text/csv",
  ].includes(m);
}

/** Soft dimension / aspect recommendations (warnings only). */
export function softDimensionWarnings(kind: UploadKind, width: number, height: number): string[] {
  if (!width || !height) return [];
  const ratio = width / height;
  const warnings: string[] = [];
  switch (kind) {
    case "event_banner": {
      if (width < 1600 || height < 700) {
        warnings.push("Banner looks small — recommend at least ~1600×900 (ideally 1920×1080).");
      }
      if (ratio < 1.5 || ratio > 2.6) {
        warnings.push("Banner aspect should be about 16:9 or 2.4:1 landscape.");
      }
      break;
    }
    case "event_gallery":
    case "competition_image": {
      if (width < 1000 || height < 600) {
        warnings.push("Image looks small — recommend 1200×800 or 1600×900.");
      }
      if (ratio < 1.3 || ratio > 2.0) {
        warnings.push("Prefer landscape 3:2 or 16:9 for gallery / track images.");
      }
      break;
    }
    case "sponsor_logo":
    case "collaborator_logo":
    case "partner_logo": {
      if (width < 200 || height < 100) {
        warnings.push("Logo looks small — recommend 400×400 or 400×200.");
      }
      if (ratio < 0.8 || ratio > 2.5) {
        warnings.push("Logo aspect should be near 1:1 square or 2:1 horizontal.");
      }
      break;
    }
    case "speaker_photo": {
      if (width < 300 || height < 300) {
        warnings.push("Avatar looks small — recommend 400×400.");
      }
      if (ratio < 0.85 || ratio > 1.15) {
        warnings.push("Avatar should be roughly square (1:1).");
      }
      break;
    }
    default:
      break;
  }
  return warnings;
}

export function pathForUploadKind(opts: {
  kind: UploadKind;
  ownerId: string;
  eventId?: string | null;
  fileId: string;
  safeName: string;
}): string {
  const cfg = UPLOAD_KIND_CONFIG[opts.kind];
  const eventPart = opts.eventId ? `${opts.eventId}/` : "";
  return `${cfg.folder}/${eventPart}${opts.ownerId}/${opts.fileId}-${opts.safeName}`;
}

/** Default plan media quota (bytes) when plan has no explicit cap. */
export const DEFAULT_MEDIA_QUOTA_BYTES: Record<string, number> = {
  free: 200 * 1024 * 1024,
  starter: 500 * 1024 * 1024,
  pro: 2 * 1024 * 1024 * 1024,
  business: 5 * 1024 * 1024 * 1024,
};
