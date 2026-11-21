import { Calendar, MapPin, Wifi } from "lucide-react";
import { formatDateMedium } from "@/src/lib/datetime";
import { isGoogleEmbedUrl, openInMapsHref } from "@/src/lib/mapsUrl";
import type { PublicEventDto } from "@/src/features/events/types";

/** Location / format / registration window — quick bar owns date/time/admission/capacity. */
export function PublicEventFacts({ dto }: { dto: PublicEventDto }) {
  const venue = [dto.location.venueName, dto.location.address, dto.location.city]
    .filter(Boolean)
    .join(", ");
  const regWindow = [
    dto.registrationOpenDate ? `Opens ${formatDateMedium(dto.registrationOpenDate)}` : null,
    dto.registrationCloseDate ? `Closes ${formatDateMedium(dto.registrationCloseDate)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const mapsHref = openInMapsHref(dto.location.mapsUrl);
  const format = dto.schedule.formatLabel || dto.formatLabel;

  if (!venue && !format && !regWindow && !mapsHref) return null;

  return (
    <section className="space-y-6">
      <h2 className="font-display text-lg text-[var(--mkt-ink)]">Location &amp; access</h2>
      <div className="grid grid-cols-1 gap-5 border-y border-[var(--mkt-line)] py-6 sm:grid-cols-2">
        {venue ? <Fact icon={<MapPin className="h-4 w-4" />} label="Venue" value={venue} /> : null}
        {format ? <Fact icon={<Wifi className="h-4 w-4" />} label="Format" value={format} /> : null}
        {regWindow ? (
          <Fact icon={<Calendar className="h-4 w-4" />} label="Registration" value={regWindow} />
        ) : null}
      </div>

      {mapsHref ? (
        <div className="space-y-3">
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-sm font-semibold text-[var(--mkt-accent-deep)] underline underline-offset-2"
          >
            Open in Maps
          </a>
          {isGoogleEmbedUrl(mapsHref) ? (
            <iframe
              title="Venue map"
              src={mapsHref}
              className="h-48 w-full rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)]"
            />
          ) : null}
          {dto.location.venueName ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="mkt-card rounded-xl p-4 text-sm text-[var(--mkt-muted)]">
                <p className="font-semibold text-[var(--mkt-ink)]">{dto.location.venueName}</p>
                {dto.location.address ? (
                  <p className="mt-1 leading-relaxed">{dto.location.address}</p>
                ) : null}
              </div>
              {dto.location.city ? (
                <div className="mkt-card rounded-xl p-4 text-sm text-[var(--mkt-muted)]">
                  <p className="font-semibold text-[var(--mkt-ink)]">City</p>
                  <p className="mt-1">{dto.location.city}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[var(--mkt-accent)]" aria-hidden="true">
        {icon}
      </span>
      <dl className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--mkt-muted)]">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm text-[var(--mkt-ink)]">{value}</dd>
      </dl>
    </div>
  );
}
