/**
 * Sole registration window (docs/24 A1).
 * Date-only bounds use the event timezone: open 00:00:00, close 23:59:59.
 */

import { fromEventLocalInput } from "@/src/lib/datetime";

export const CLOSING_SOON_MS = 48 * 60 * 60 * 1000;

export type RegistrationState =
  | "unpublished"
  | "not_open"
  | "open"
  | "closing_soon"
  | "closed"
  | "full"
  | "waitlist"
  | "event_ended"
  | "preview";

export type RegistrationReminder = {
  startsAt: string;
  endsAt: string;
  title: string;
};

export type RegistrationStateResult = {
  state: RegistrationState;
  opensAt: string | null;
  closesAt: string | null;
  closeInherited: boolean;
  message: string;
  ctaLabel: string | null;
  canRegister: boolean;
  reminder: RegistrationReminder | null;
};

type ScheduleLike = { timezone?: string | null } | null | undefined;

export type RegistrationEventInput = {
  status?: string | null;
  requiresRegistration?: boolean | null;
  registrationOpenDate?: string | null;
  registrationCloseDate?: string | null;
  waitlistEnabled?: boolean | null;
  seatsLeft?: number | null;
  schedule?: ScheduleLike;
  hasCompetitions?: boolean | null;
};

export type RegistrationCompetitionInput = {
  id?: string | null;
  registrationClosesAt?: string | null;
  ended?: boolean | null;
  seatsLeft?: number | null;
  waitlistEnabled?: boolean | null;
};

export type GetRegistrationStateInput = {
  event: RegistrationEventInput;
  competition?: RegistrationCompetitionInput | null;
  competitions?: RegistrationCompetitionInput[] | null;
  now?: Date;
  timezone?: string | null;
  preview?: boolean;
  eventTitle?: string | null;
};

/**
 * Coerce stored schedule labels into an IANA zone.
 * Windows / display strings like "Pakistan Standard Time (PKT, UTC+5)" crash Intl.
 */
export function resolveIanaTimeZone(raw: string | null | undefined): string {
  const value = String(raw || "").trim();
  if (!value) return "UTC";
  if (isValidIanaTimeZone(value)) return value;
  const lower = value.toLowerCase();
  if (
    lower.includes("pakistan") ||
    lower.includes("pkt") ||
    lower === "karachi" ||
    lower.includes("asia/karachi")
  ) {
    return "Asia/Karachi";
  }
  return "UTC";
}

function isValidIanaTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/** Instant for a date-only or local datetime bound in the event timezone. */
export function registrationBoundInstant(
  raw: string | null | undefined,
  edge: "start" | "end",
  timeZone?: string | null,
): Date | null {
  const value = String(raw || "").trim();
  if (!value) return null;
  const tz = resolveIanaTimeZone(timeZone);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const local = edge === "start" ? `${value}T00:00:00` : `${value}T23:59:59`;
    const iso = fromEventLocalInput(local, tz);
    return iso ? new Date(iso) : null;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) && !/(?:[zZ]|[+-]\d{2}:\d{2})$/.test(value)) {
    const local = value.length === 16 ? `${value}:00` : value.slice(0, 19);
    const iso = fromEventLocalInput(local, tz);
    return iso ? new Date(iso) : null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getRegistrationState(input: GetRegistrationStateInput): RegistrationStateResult {
  const tz = resolveIanaTimeZone(input.timezone || input.event.schedule?.timezone);
  const now = input.now ?? new Date();
  const opens = registrationBoundInstant(input.event.registrationOpenDate, "start", tz);
  const eventClose = registrationBoundInstant(input.event.registrationCloseDate, "end", tz);

  if (input.preview) {
    return pack({
      state: "preview",
      opens,
      closes: eventClose,
      closeInherited: false,
      tz,
      now,
      eventTitle: input.eventTitle,
    });
  }

  const status = String(input.event.status || "")
    .trim()
    .toLowerCase();
  if (status === "draft" || status === "unpublished") {
    return pack({
      state: "unpublished",
      opens,
      closes: eventClose,
      closeInherited: false,
      tz,
      now,
      eventTitle: input.eventTitle,
    });
  }
  if (status === "completed" || status === "cancelled" || status === "archived") {
    return pack({
      state: "event_ended",
      opens,
      closes: eventClose,
      closeInherited: false,
      tz,
      now,
      eventTitle: input.eventTitle,
    });
  }

  if (opens && now < opens) {
    return pack({
      state: "not_open",
      opens,
      closes: eventClose,
      closeInherited: false,
      tz,
      now,
      eventTitle: input.eventTitle,
    });
  }

  if (input.competition) {
    return oneWindow({
      now,
      tz,
      opens,
      eventClose,
      eventTitle: input.eventTitle,
      competition: input.competition,
      event: input.event,
    });
  }

  const tracks = input.competitions;
  if (input.event.hasCompetitions && tracks && tracks.length > 0) {
    const judged = tracks.map((competition) =>
      oneWindow({
        now,
        tz,
        opens,
        eventClose,
        eventTitle: input.eventTitle,
        competition,
        event: input.event,
      }),
    );
    const allShut = judged.every((row) => row.state === "closed" || row.state === "full");
    if (allShut) {
      const latest = judged.reduce<Date | null>((acc, row) => {
        if (!row.closesAt) return acc;
        const d = new Date(row.closesAt);
        if (!acc || d > acc) return d;
        return acc;
      }, eventClose);
      return pack({
        state: "closed",
        opens,
        closes: latest,
        closeInherited: false,
        tz,
        now,
        eventTitle: input.eventTitle,
      });
    }
    const accepting = judged.filter(
      (row) => row.canRegister || row.state === "open" || row.state === "closing_soon",
    );
    const pool =
      accepting.length > 0
        ? accepting
        : judged.filter((row) => row.state !== "closed" && row.state !== "full");
    const earliest = pool.reduce<RegistrationStateResult | null>((best, row) => {
      if (!best) return row;
      if (!row.closesAt) return best;
      if (!best.closesAt) return row;
      return row.closesAt < best.closesAt ? row : best;
    }, null);
    if (earliest) return earliest;
  }

  return oneWindow({
    now,
    tz,
    opens,
    eventClose,
    eventTitle: input.eventTitle,
    competition: null,
    event: input.event,
  });
}

function oneWindow(args: {
  now: Date;
  tz: string;
  opens: Date | null;
  eventClose: Date | null;
  eventTitle?: string | null;
  competition: RegistrationCompetitionInput | null;
  event: RegistrationEventInput;
}): RegistrationStateResult {
  const inherited =
    !!args.competition && !String(args.competition.registrationClosesAt || "").trim();
  const closes = args.competition
    ? registrationBoundInstant(args.competition.registrationClosesAt, "end", args.tz) ||
      args.eventClose
    : args.eventClose;
  const closeInherited = inherited && !!closes;

  if (args.competition?.ended) {
    return pack({
      state: "closed",
      opens: args.opens,
      closes,
      closeInherited,
      tz: args.tz,
      now: args.now,
      eventTitle: args.eventTitle,
    });
  }
  if (closes && args.now > closes) {
    return pack({
      state: "closed",
      opens: args.opens,
      closes,
      closeInherited,
      tz: args.tz,
      now: args.now,
      eventTitle: args.eventTitle,
    });
  }

  const seats =
    args.competition && args.competition.seatsLeft != null
      ? args.competition.seatsLeft
      : args.event.seatsLeft;
  const waitlist =
    args.competition && args.competition.waitlistEnabled != null
      ? !!args.competition.waitlistEnabled
      : !!args.event.waitlistEnabled;
  if (seats != null && seats <= 0) {
    return pack({
      state: waitlist ? "waitlist" : "full",
      opens: args.opens,
      closes,
      closeInherited,
      tz: args.tz,
      now: args.now,
      eventTitle: args.eventTitle,
    });
  }

  const closingSoon = !!closes && closes.getTime() - args.now.getTime() <= CLOSING_SOON_MS;
  return pack({
    state: closingSoon ? "closing_soon" : "open",
    opens: args.opens,
    closes,
    closeInherited,
    tz: args.tz,
    now: args.now,
    eventTitle: args.eventTitle,
  });
}

function pack(args: {
  state: RegistrationState;
  opens: Date | null;
  closes: Date | null;
  closeInherited: boolean;
  tz: string;
  now: Date;
  eventTitle?: string | null;
}): RegistrationStateResult {
  const opensAt = args.opens ? args.opens.toISOString() : null;
  const closesAt = args.closes ? args.closes.toISOString() : null;
  const canRegister =
    args.state === "open" || args.state === "closing_soon" || args.state === "waitlist";
  const inheritedNote = args.closeInherited ? " (event deadline)" : "";
  let message = "";
  let ctaLabel: string | null = null;

  if (args.state === "not_open" && args.opens) {
    message = `Registration opens ${formatWhen(args.opens, args.tz, true)} (${inPhrase(args.now, args.opens)})`;
  } else if (args.state === "not_open") {
    message = "Registration is not open yet";
  } else if (args.state === "open" || args.state === "closing_soon") {
    message = args.closes
      ? `Closes ${formatWhen(args.closes, args.tz, false)} (${inPhrase(args.now, args.closes)})${inheritedNote}`
      : "Registration is open";
    ctaLabel = "Register";
  } else if (args.state === "closed") {
    message = args.closes
      ? `Registration closed on ${formatWhen(args.closes, args.tz, false)}`
      : "Registration closed";
  } else if (args.state === "full") {
    message = "Sold out";
  } else if (args.state === "waitlist") {
    message = "Join the waitlist";
    ctaLabel = "Join the waitlist";
  } else if (args.state === "event_ended") {
    message = "This event has ended";
  } else if (args.state === "preview") {
    message = "Preview only — registration is not open on this view";
  } else {
    message = "Not published yet";
  }

  const reminder =
    args.state === "not_open" && args.opens
      ? {
          startsAt: args.opens.toISOString(),
          endsAt: new Date(args.opens.getTime() + 15 * 60_000).toISOString(),
          title: args.eventTitle ? `Registration opens — ${args.eventTitle}` : "Registration opens",
        }
      : null;

  return {
    state: args.state,
    opensAt,
    closesAt,
    closeInherited: args.closeInherited,
    message,
    ctaLabel,
    canRegister,
    reminder,
  };
}

function formatWhen(d: Date, timeZone: string, withTime: boolean): string {
  const tz = resolveIanaTimeZone(timeZone);
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    day: "numeric",
    month: "short",
  }).format(d);
  if (!withTime) return date;
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
  return `${date}, ${time}`;
}

function inPhrase(from: Date, to: Date): string {
  const ms = to.getTime() - from.getTime();
  if (ms <= 60_000) return "in 1 minute";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `in ${minutes} minutes`;
  const hours = Math.round(ms / 3_600_000);
  if (hours < 48) return hours === 1 ? "in 1 hour" : `in ${hours} hours`;
  const days = Math.max(1, Math.round(ms / 86_400_000));
  return days === 1 ? "in 1 day" : `in ${days} days`;
}
