"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { buttonClass } from "@/src/lib/ui";
import {
  buildIcs,
  googleCalendarTemplateUrl,
} from "@/src/features/connections/lib/calendarFallbacks";

/**
 * "Add reminder" for registration-not-yet-open — Google Calendar + .ics
 * around the opensAt instant (docs/24 A1).
 */
export function RegistrationReminderButton({
  title,
  startsAt,
  endsAt,
  url,
}: {
  title: string;
  startsAt: string;
  endsAt: string;
  url?: string;
}) {
  const [open, setOpen] = useState(false);
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime())) return null;

  const input = {
    uid: `reg-open-${startsAt}`,
    title,
    description: "Registration opens for this event on Avoeline.",
    url,
    start,
    end: Number.isNaN(end.getTime()) ? new Date(start.getTime() + 15 * 60_000) : end,
  };

  const downloadIcs = () => {
    const ics = buildIcs(input);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "registration-opens.ics";
    a.click();
    URL.revokeObjectURL(href);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={buttonClass("secondary", "sm")}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <CalendarPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Add reminder
      </button>
      {open ? (
        <div className="absolute left-0 z-20 mt-1 min-w-[10rem] rounded-xl border border-line bg-paper p-1 shadow-sm">
          <a
            href={googleCalendarTemplateUrl(input)}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-canvas"
            onClick={() => setOpen(false)}
          >
            Google Calendar
          </a>
          <button
            type="button"
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-canvas"
            onClick={downloadIcs}
          >
            Apple / Outlook (.ics)
          </button>
        </div>
      ) : null}
    </div>
  );
}
