import "server-only";

import { TABLES } from "@/data/collections";
import { supabaseAdmin } from "@/data/supabase";
import { getRegistrationState } from "@/src/lib/registrationState";
import { logger } from "@/src/lib/logger";

export type RegistrationEligibleEvent = {
  id: string;
  organizerId: string;
  status: string;
  requiresRegistration: boolean;
  schedule: { startDate?: string; endDate?: string } | null;
};

export type RegistrationEligibilityFail = {
  ok: false;
  code: "NOT_FOUND" | "NO_REGISTRATION" | "CLOSED" | "INVALID_ID";
  /** Attendee-safe message */
  message: string;
  status: 400 | 404;
};

export type RegistrationEligibilityOk = {
  ok: true;
  event: RegistrationEligibleEvent;
};

/**
 * Shared gate for public registration submit and proof upload.
 * Draft / completed / cancelled / archived → CLOSED (not a fake "not found").
 * Missing row or DB error → NOT_FOUND (DB errors logged, never leaked).
 */
export async function assertPublicRegistrationEvent(
  eventId: string,
): Promise<RegistrationEligibilityOk | RegistrationEligibilityFail> {
  const id = String(eventId || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return {
      ok: false,
      code: "INVALID_ID",
      message: "We couldn't find this event. Refresh the page and try again.",
      status: 400,
    };
  }

  // events has no `schedule` jsonb — dates live in start_date / end_date / timezone
  // (EventModel composes schedule the same way). Selecting a missing column made
  // PostgREST error and the API falsely returned "couldn't find this event".
  const { data: event, error: eventErr } = await supabaseAdmin
    .from(TABLES.EVENTS)
    .select(
      "id, organizer_id, status, requires_registration, start_date, end_date, start_time, end_time, registration_open_date, registration_close_date, timezone",
    )
    .eq("id", id)
    .maybeSingle();

  if (eventErr) {
    logger.error("[assertPublicRegistrationEvent]", {
      code: eventErr.code,
      message: eventErr.message,
    });
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "We couldn't find this event. Refresh the page and try again.",
      status: 404,
    };
  }
  if (!event) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "We couldn't find this event. Refresh the page and try again.",
      status: 404,
    };
  }

  if (event.requires_registration === false) {
    return {
      ok: false,
      code: "NO_REGISTRATION",
      message: "This event does not take registrations.",
      status: 400,
    };
  }

  const tz = String(event.timezone || "").trim() || "UTC";
  const schedule = {
    startDate: event.start_date ? String(event.start_date) : undefined,
    endDate: event.end_date ? String(event.end_date) : undefined,
    startTime: event.start_time ? String(event.start_time) : undefined,
    endTime: event.end_time ? String(event.end_time) : undefined,
    timezone: tz,
  };

  const reg = getRegistrationState({
    event: {
      status: String(event.status || ""),
      requiresRegistration: event.requires_registration !== false,
      registrationOpenDate: event.registration_open_date,
      registrationCloseDate: event.registration_close_date,
      schedule,
    },
    timezone: tz,
  });

  // S2: server re-check — only states with canRegister (open | closing_soon | waitlist).
  if (!reg.canRegister) {
    return {
      ok: false,
      code: "CLOSED",
      message: reg.message || "This event is not open for registration right now.",
      status: 400,
    };
  }

  return {
    ok: true,
    event: {
      id: String(event.id),
      organizerId: String(event.organizer_id),
      status: String(event.status || ""),
      requiresRegistration: event.requires_registration !== false,
      schedule,
    },
  };
}
