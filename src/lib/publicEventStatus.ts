import type { EventLifecycle } from "@/src/lib/eventState";
import { eventLifecycle, isActiveLifecycle } from "@/src/lib/eventState";
import {
  competitionRegisterState,
  effectiveRegistrationClosesAt,
  isCompetitionRegistrationOpen,
} from "@/src/lib/competitionRegistration";
import {
  getRegistrationState,
  registrationBoundInstant as registrationBoundInstantCanonical,
} from "@/src/lib/registrationState";

export type PublicEventBanner = {
  lifecycle: EventLifecycle;
  /** Registration / join is open (lifecycle + optional open/close dates). */
  registrationOpen: boolean;
  /** Show a status banner above the page. */
  banner: string | null;
};

export type RegistrationWindow = {
  registrationOpenDate?: string | null;
  registrationCloseDate?: string | null;
  /** IANA timezone from event.schedule — used for date-only open/close bounds. */
  timezone?: string | null;
};

/**
 * Instant for a date-only (YYYY-MM-DD) bound in the event timezone.
 * Delegates to canonical registrationBoundInstant (docs/24 A1).
 */
export function registrationBoundInstant(
  raw: string | null | undefined,
  edge: "start" | "end",
  timeZone?: string | null,
): Date | null {
  return registrationBoundInstantCanonical(raw, edge, String(timeZone || "").trim() || "UTC");
}

/**
 * Whether the event's registration open/close dates currently allow signup.
 * Thin wrapper over getRegistrationState (date window only — ignores seats).
 */
export function isWithinRegistrationDates(
  registration: RegistrationWindow | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!registration) return true;
  const tz = String(registration.timezone || "").trim() || "UTC";
  const reg = getRegistrationState({
    event: {
      status: "published",
      requiresRegistration: true,
      registrationOpenDate: registration.registrationOpenDate,
      registrationCloseDate: registration.registrationCloseDate,
      schedule: { timezone: tz },
    },
    timezone: tz,
    now,
  });
  return (
    reg.state === "open" ||
    reg.state === "closing_soon" ||
    reg.state === "waitlist" ||
    reg.state === "full"
  );
}

export function publicEventPresentation(
  status: string | null | undefined,
  schedule: Parameters<typeof eventLifecycle>[1],
  registration?: RegistrationWindow | null,
  now: Date = new Date(),
): PublicEventBanner {
  const lifecycle = eventLifecycle(status, schedule, now);
  const lifecycleAllows = isActiveLifecycle(lifecycle);
  const datesAllow = isWithinRegistrationDates(registration, now);
  const registrationOpen = lifecycleAllows && datesAllow;

  const banners: Partial<Record<EventLifecycle, string>> = {
    completed: "Completed — registration closed",
    cancelled: "Cancelled — registration closed",
    archived: "Archived — registration closed",
    draft: "Draft preview — not published",
  };

  let banner = banners[lifecycle] ?? null;
  if (!banner && lifecycleAllows && !datesAllow) {
    const opens = registrationBoundInstant(
      registration?.registrationOpenDate,
      "start",
      registration?.timezone,
    );
    if (opens && now < opens) {
      banner = `Registration opens on ${opens.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}.`;
    } else {
      banner = "Registration is closed for this event.";
    }
  }

  return {
    lifecycle,
    registrationOpen,
    banner,
  };
}

/** Competition still accepts new entrants (not ended; per-track + event close fallback). */
export function trackRegistrationOpen(
  track: { status?: string | null; registrationClosesAt?: string | null },
  opts?: {
    /** When false, competition registration is closed regardless of track dates. */
    eventRegistrationOpen?: boolean;
    eventRegistrationCloseDate?: string | null;
    seatsLeft?: number | null;
    waitlistEnabled?: boolean;
    now?: Date;
  },
): boolean {
  // Prefer explicit === false so TS never sees `true | undefined !== false` as empty.
  if (opts?.eventRegistrationOpen === false) return false;
  const eventLifecycleActive = true;
  const effective = effectiveRegistrationClosesAt(
    track.registrationClosesAt,
    opts?.eventRegistrationCloseDate,
    "UTC",
  );
  const state = competitionRegisterState({
    effectiveClosesAt: effective,
    trackEnded: String(track.status || "").toLowerCase() === "ended",
    eventLifecycleActive,
    seatsLeft: opts?.seatsLeft ?? null,
    waitlistEnabled: !!opts?.waitlistEnabled,
    now: opts?.now,
  });
  return isCompetitionRegistrationOpen(state);
}

export {
  effectiveRegistrationClosesAt,
  competitionRegisterState,
} from "@/src/lib/competitionRegistration";
