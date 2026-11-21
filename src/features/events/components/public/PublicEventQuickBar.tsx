import { Calendar, Clock, MapPin, Ticket, Users } from "lucide-react";
import { formatDateMedium, formatTime } from "@/src/lib/datetime";
import type { PublicEventDto } from "@/src/features/events/types";
import { capacityPercent, showSeatsFact } from "./publicPage.logic";

export function PublicEventQuickBar({ dto }: { dto: PublicEventDto }) {
  const startDate = formatDateMedium(dto.schedule.startDate);
  const endDate = formatDateMedium(dto.schedule.endDate);
  const dateLabel =
    endDate && endDate !== startDate ? `${startDate} – ${endDate}` : startDate || "—";
  const timeLabel = [formatTime(dto.schedule.startTime), formatTime(dto.schedule.endTime)]
    .filter(Boolean)
    .join(" – ");
  const tz = dto.schedule.timezone || dto.timezone;
  const scheduleLabel = timeLabel ? `${timeLabel}${tz ? ` · ${tz}` : ""}` : tz || "—";
  const venue =
    [dto.location.venueName, dto.location.city].filter(Boolean).join(", ") ||
    dto.location.address ||
    "—";
  const showCapacity = showSeatsFact(dto.seats);
  const pct = capacityPercent(dto.seats);

  return (
    <section
      aria-label="Event at a glance"
      className="border-y border-[var(--mkt-line)] bg-[var(--mkt-surface)]"
    >
      <div className="mx-auto grid max-w-[var(--mkt-max,80rem)] gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6 lg:px-10">
        <QuickItem icon={<Calendar className="h-4 w-4" />} label="Date" value={dateLabel} />
        <QuickItem icon={<Clock className="h-4 w-4" />} label="Schedule" value={scheduleLabel} />
        <QuickItem icon={<MapPin className="h-4 w-4" />} label="Venue" value={venue} />
        <QuickItem
          icon={<Ticket className="h-4 w-4" />}
          label="Admission"
          value={dto.admissionLabel || "—"}
        />
        {showCapacity ? (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[var(--mkt-accent)]" aria-hidden>
              <Users className="h-4 w-4" />
            </span>
            <dl className="min-w-0 flex-1">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mkt-muted)]">
                Capacity
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--mkt-ink)]">
                {pct != null ? `${pct}% booked` : `${dto.seats.left} left`}
              </dd>
              {pct != null ? (
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--mkt-line)]"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${pct}% booked`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--mkt-accent)]"
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>
              ) : null}
            </dl>
          </div>
        ) : (
          <QuickItem
            icon={<Users className="h-4 w-4" />}
            label="Capacity"
            value={dto.schedule.formatLabel || dto.formatLabel || "Open"}
          />
        )}
      </div>
    </section>
  );
}

function QuickItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[var(--mkt-accent)]" aria-hidden>
        {icon}
      </span>
      <dl className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mkt-muted)]">
          {label}
        </dt>
        <dd className="mt-1 text-sm font-semibold leading-snug text-[var(--mkt-ink)]">{value}</dd>
      </dl>
    </div>
  );
}
