/**
 * Pure helpers for the public event DTO / register CTA.
 * Kept free of `server-only` so unit tests can import without Next runtime.
 */

import type { EventLifecycle } from "@/src/lib/eventState";
import { getRegistrationState } from "@/src/lib/registrationState";
import type { LegacyRegisterButtonState, PublicOrgCredit } from "./types";

/** Keys that must never appear on a client-facing public event payload. */
export const PUBLIC_EVENT_FORBIDDEN_KEYS = [
  "accessCode",
  "access_code",
  "meetingPassword",
  "meeting_password",
  "meetingLink",
  "meeting_link",
  "whitelist",
  "promoCodes",
  "promo_codes",
  "promoHints",
  "promo_hints",
  "code",
  "iban",
  "bankName",
  "bank_name",
  "accountNumber",
  "account_number",
  "organizerEmail",
  "organizerPhone",
  "contactEmail",
  "contactPhone",
  "contractValue",
  "contract_value",
  "benefits",
  "flagHash",
  "flag_hash",
  "flag",
  "hint",
  "hints",
  "tasks",
  "inviteToken",
  "invite_token",
  "judgeLink",
  "judge_link",
  "judgeInviteUrl",
  "teamSecrets",
  "paymentScreenshot",
] as const;

export function dtoContainsForbiddenKey(value: unknown, path = ""): string | null {
  if (value == null) return null;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = dtoContainsForbiddenKey(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof value !== "object") return null;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const full = path ? `${path}.${key}` : key;
    if ((PUBLIC_EVENT_FORBIDDEN_KEYS as readonly string[]).includes(key)) {
      return full;
    }
    const hit = dtoContainsForbiddenKey(child, full);
    if (hit) return hit;
  }
  return null;
}

/**
 * @deprecated Prefer getRegistrationState from `@/src/lib/registrationState`.
 * Thin adapter kept for legacy tests / call sites.
 */
export function resolveRegisterButtonState(input: {
  preview: boolean;
  requiresRegistration: boolean;
  lifecycle: EventLifecycle;
  registrationOpen: boolean;
  registrationOpenDate: string;
  seatsLeft: number | null;
  waitlistEnabled: boolean;
  hasTracks: boolean;
  openCompetitionCount: number;
  now?: Date;
  timezone?: string | null;
  registrationCloseDate?: string | null;
}): LegacyRegisterButtonState {
  const statusFromLifecycle =
    input.lifecycle === "draft"
      ? "draft"
      : input.lifecycle === "completed"
        ? "completed"
        : input.lifecycle === "cancelled"
          ? "cancelled"
          : input.lifecycle === "archived"
            ? "archived"
            : "published";

  const competitions =
    input.hasTracks && input.openCompetitionCount === 0
      ? [{ id: "closed", ended: true as const, registrationClosesAt: null }]
      : input.hasTracks
        ? Array.from({ length: Math.max(1, input.openCompetitionCount) }, (_, i) => ({
            id: `open-${i}`,
            ended: false as const,
            registrationClosesAt: null as string | null,
          }))
        : null;

  const result = getRegistrationState({
    event: {
      status: statusFromLifecycle,
      requiresRegistration: input.requiresRegistration,
      registrationOpenDate: input.registrationOpenDate || null,
      registrationCloseDate: input.registrationCloseDate ?? null,
      waitlistEnabled: input.waitlistEnabled,
      seatsLeft: input.seatsLeft,
      schedule: { timezone: input.timezone || "UTC" },
      hasCompetitions: input.hasTracks,
    },
    competitions,
    preview: input.preview,
    now: input.now,
    timezone: input.timezone || "UTC",
  });

  if (result.state === "preview") return "admin_preview";
  if (!input.requiresRegistration) return "no_registration";
  if (result.state === "event_ended") return "ended";
  if (result.state === "not_open") return "opens_at";
  if (result.state === "closed" && input.hasTracks) return "competitions_closed";
  if (result.state === "closed") return "closed";
  if (result.state === "full") return "sold_out";
  if (result.state === "waitlist") return "waitlist";
  // Legacy: registrationOpen false without dates → closed
  if (!input.registrationOpen && result.state === "open") return "closed";
  return "open";
}

/** Filter org credits by the three public show_* toggles. */
export function filterPublicOrgCredits(
  orgs: PublicOrgCredit[],
  toggles: { showSponsors: boolean; showCollaborators: boolean; showPartners: boolean },
): { sponsors: PublicOrgCredit[]; collaborators: PublicOrgCredit[]; partners: PublicOrgCredit[] } {
  return {
    sponsors: toggles.showSponsors ? orgs.filter((o) => o.type === "sponsor") : [],
    collaborators: toggles.showCollaborators ? orgs.filter((o) => o.type === "collaborator") : [],
    partners: toggles.showPartners ? orgs.filter((o) => o.type === "partner") : [],
  };
}
