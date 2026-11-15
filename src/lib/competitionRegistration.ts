/**
 * Compatibility wrappers around getRegistrationState (docs/24 A1).
 * Prefer importing getRegistrationState directly for new code.
 */

import {
  getRegistrationState,
  registrationBoundInstant,
  type RegistrationState,
} from "@/src/lib/registrationState";

export type CompetitionRegisterState = "not_yet_open" | "open" | "closed" | "full";

function mapState(state: RegistrationState): CompetitionRegisterState {
  if (state === "not_open") return "not_yet_open";
  if (state === "full") return "full";
  if (state === "open" || state === "closing_soon" || state === "waitlist") return "open";
  return "closed";
}

/** Prefer competition close; else event close (date-only → end of day in event TZ). */
export function effectiveRegistrationClosesAt(
  trackClosesAt: string | null | undefined,
  eventClosesAt: string | null | undefined,
  timeZone: string | null | undefined = "UTC",
): string | null {
  const tz = String(timeZone || "").trim() || "UTC";
  const track = String(trackClosesAt || "").trim();
  if (track) {
    const d = registrationBoundInstant(track, "end", tz);
    return d ? d.toISOString() : track;
  }
  const eventClose = String(eventClosesAt || "").trim();
  if (!eventClose) return null;
  const d = registrationBoundInstant(eventClose, "end", tz);
  return d ? d.toISOString() : eventClose;
}

export function competitionRegisterState(input: {
  effectiveClosesAt: string | null;
  opensAt?: string | null;
  trackEnded?: boolean;
  eventLifecycleActive: boolean;
  seatsLeft: number | null;
  waitlistEnabled: boolean;
  now?: Date;
  /** Event timezone for date-only bounds (defaults UTC). */
  timezone?: string | null;
  eventStatus?: string | null;
}): CompetitionRegisterState {
  if (!input.eventLifecycleActive || input.trackEnded) return "closed";
  const tz = String(input.timezone || "").trim() || "UTC";
  const result = getRegistrationState({
    event: {
      status: input.eventStatus || "published",
      requiresRegistration: true,
      registrationOpenDate: input.opensAt || null,
      registrationCloseDate: input.effectiveClosesAt,
      waitlistEnabled: input.waitlistEnabled,
      seatsLeft: input.seatsLeft,
      schedule: { timezone: tz },
      hasCompetitions: true,
    },
    competition: {
      registrationClosesAt: input.effectiveClosesAt,
      ended: !!input.trackEnded,
      seatsLeft: input.seatsLeft,
      waitlistEnabled: input.waitlistEnabled,
    },
    timezone: tz,
    now: input.now,
  });
  return mapState(result.state);
}

/** Compatibility boolean used by registration form filters. */
export function isCompetitionRegistrationOpen(state: CompetitionRegisterState): boolean {
  return state === "open";
}
