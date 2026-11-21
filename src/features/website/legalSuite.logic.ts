import { z } from "zod";

export const LEGAL_SUITE_SLUGS = [
  "privacy",
  "terms",
  "organizer-agreement",
  "content-rights",
] as const;

export type LegalSuiteSlug = (typeof LEGAL_SUITE_SLUGS)[number];

const docMetaSchema = z.object({
  index: z.number().int().min(1).max(99),
  label: z.string().trim().min(1).max(80),
  navLabel: z.string().trim().min(1).max(80),
});

export const legalSuiteSettingsSchema = z.object({
  eyebrow: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(120),
  intro: z.string().trim().min(1).max(600),
  contactEmail: z.string().trim().email().max(120),
  downloadLabel: z.string().trim().min(1).max(80),
  contactLabel: z.string().trim().min(1).max(80),
  zeroSell: z.object({
    title: z.string().trim().min(1).max(80),
    body: z.string().trim().min(1).max(600),
    stat1Label: z.string().trim().min(1).max(80),
    stat1Value: z.string().trim().min(1).max(80),
    stat2Label: z.string().trim().min(1).max(80),
    stat2Value: z.string().trim().min(1).max(80),
  }),
  dpa: z.object({
    title: z.string().trim().min(1).max(160),
    body: z.string().trim().min(1).max(400),
    buttonLabel: z.string().trim().min(1).max(80),
    mailtoSubject: z.string().trim().min(1).max(160),
  }),
  docs: z.object({
    privacy: docMetaSchema,
    terms: docMetaSchema,
    "organizer-agreement": docMetaSchema,
    "content-rights": docMetaSchema,
  }),
});

export type LegalSuiteSettings = z.infer<typeof legalSuiteSettingsSchema>;

export const DEFAULT_LEGAL_SUITE_SETTINGS: LegalSuiteSettings = {
  eyebrow: "Legal & Regulatory Hub",
  title: "Compliance & Governance Suite",
  intro:
    "The structural framework governing Avoeline platform operations, data stewardship, and organizer sovereignty.",
  contactEmail: "info@aroxes.com",
  downloadLabel: "Download Bundle PDF",
  contactLabel: "Contact Legal Desk",
  zeroSell: {
    title: "Zero-Sell Guarantee",
    body: "Attendee PII is never sold, rented, or tokenized by Avoeline. Organizers remain the dedicated controllers of registration data.",
    stat1Label: "Organizer-Dedicated",
    stat1Value: "100%",
    stat2Label: "Zero-Sell Non-Tokenizable",
    stat2Value: "Guaranteed",
  },
  dpa: {
    title: "Need a Tailored Data Processing Addendum (DPA)?",
    body: "Request our standard DPA pack for enterprise or campus procurement review.",
    buttonLabel: "Request DPA Pack",
    mailtoSubject: "Avoeline DPA pack request",
  },
  docs: {
    privacy: {
      index: 1,
      label: "Privacy Architecture",
      navLabel: "Privacy & Data Architecture",
    },
    terms: {
      index: 2,
      label: "Terms of Service",
      navLabel: "Terms of Service",
    },
    "organizer-agreement": {
      index: 3,
      label: "Organizer Agreement",
      navLabel: "Organizer Agreement",
    },
    "content-rights": {
      index: 4,
      label: "Content & Verification Rights",
      navLabel: "Content & Verification Rights",
    },
  },
};

export function parseLegalSuiteSettings(raw: unknown): LegalSuiteSettings {
  const parsed = legalSuiteSettingsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  if (raw && typeof raw === "object") {
    const merged = {
      ...DEFAULT_LEGAL_SUITE_SETTINGS,
      ...(raw as Record<string, unknown>),
      zeroSell: {
        ...DEFAULT_LEGAL_SUITE_SETTINGS.zeroSell,
        ...((raw as { zeroSell?: object }).zeroSell ?? {}),
      },
      dpa: {
        ...DEFAULT_LEGAL_SUITE_SETTINGS.dpa,
        ...((raw as { dpa?: object }).dpa ?? {}),
      },
      docs: {
        ...DEFAULT_LEGAL_SUITE_SETTINGS.docs,
        ...((raw as { docs?: object }).docs ?? {}),
      },
    };
    const again = legalSuiteSettingsSchema.safeParse(merged);
    if (again.success) return again.data;
  }
  return DEFAULT_LEGAL_SUITE_SETTINGS;
}

export function isLegalSuiteSlug(value: string | null | undefined): value is LegalSuiteSlug {
  return !!value && (LEGAL_SUITE_SLUGS as readonly string[]).includes(value);
}

export function formatLegalReleaseLine(
  docs: Array<{ version: number; effectiveDate: string | null; publishedAt: string }>,
): string {
  if (!docs.length) return "Current Release — Pending publish";
  const maxVersion = Math.max(...docs.map((d) => d.version));
  const dates = docs
    .map((d) => d.effectiveDate || d.publishedAt.slice(0, 10))
    .filter(Boolean)
    .sort();
  const latest = dates[dates.length - 1];
  if (!latest) return `Current Release v${maxVersion}`;
  const formatted = new Date(`${latest}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `Current Release v${maxVersion} — Effective ${formatted}`;
}
