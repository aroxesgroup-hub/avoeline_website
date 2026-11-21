import Image from "next/image";
import Link from "next/link";
import { buttonClass } from "@/src/lib/ui";
import { formatCurrency } from "@/src/lib/money";
import { formatDate } from "@/src/lib/datetime";
import { HACKATHON_KIND_LABELS } from "@/src/features/hackathon/kinds";
import type { PublicCompetition } from "@/src/features/events/types";

function registerLabel(track: PublicCompetition): string {
  if (track.registrationCtaLabel) return track.registrationCtaLabel;
  if (track.registerState === "full") return "Sold out";
  if (track.registerState === "not_open") return "Not yet open";
  if (track.registerState === "waitlist") return "Join the waitlist";
  if (track.registerState === "closing_soon") return "Register";
  if (track.canRegister) return "Register team";
  return "Closed";
}

function statusBadge(state: PublicCompetition["registerState"]): string {
  if (state === "open" || state === "closing_soon") return "Open";
  if (state === "full") return "Full";
  if (state === "waitlist") return "Waitlist";
  if (state === "not_open") return "Not yet open";
  return "Closed";
}

export function PublicCompetitions({
  eventId,
  competitions,
  qsSuffix = "",
}: {
  eventId: string;
  competitions: PublicCompetition[];
  qsSuffix?: string;
}) {
  if (!competitions.length) return null;

  const join = qsSuffix.includes("?") ? "&" : "?";

  return (
    <section className="space-y-6 border-t border-[var(--mkt-line)] pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-[var(--mkt-ink)]">Competitions</h2>
          <p className="mt-1 text-sm text-[var(--mkt-muted)]">
            {competitions.length} competition{competitions.length === 1 ? "" : "s"}, each with its
            own team size, close date and prizes.
          </p>
        </div>
        <Link
          href={`/events/${eventId}/tracks${qsSuffix}`}
          className={buttonClass("secondary", "sm")}
        >
          See all
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {competitions.map((track) => {
          const detailHref = `/events/${eventId}/tracks/${track.id}${qsSuffix}`;
          const registerHref = `/events/${eventId}${qsSuffix}${join}track=${encodeURIComponent(track.id)}#register`;
          const closeLabel = track.effectiveRegistrationClosesAt
            ? `${formatDate(track.effectiveRegistrationClosesAt)}${
                track.closeInherited ? " (event deadline)" : ""
              }`
            : "See event page";
          const isCtf = track.kind === "ctf";
          const open = track.canRegister && track.registerState !== "waitlist";
          return (
            <li key={track.id} className="mkt-card flex flex-col overflow-hidden rounded-2xl">
              <Link
                href={detailHref}
                className="group relative block aspect-[4/3] w-full bg-[var(--mkt-surface-low)] focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {track.imageUrl ? (
                  <Image
                    src={track.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-contain object-center p-2 transition group-hover:opacity-95"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-display text-3xl text-[var(--mkt-muted)]">
                    {track.name.slice(0, 1) || "?"}
                  </span>
                )}
                {track.sponsorLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={track.sponsorLogoUrl}
                    alt={track.sponsorName || "Sponsor"}
                    className="absolute bottom-3 right-3 h-10 w-auto max-w-[40%] rounded-lg bg-white/90 object-contain p-1 shadow-sm"
                  />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base text-[var(--mkt-ink)]">{track.name}</h3>
                  {isCtf ? (
                    <span className="rounded-md border border-[var(--mkt-line)] bg-[var(--mkt-surface-low)] px-1.5 py-0.5 text-2xs font-semibold uppercase text-[var(--mkt-ink)]">
                      CTF
                    </span>
                  ) : null}
                  <span className="rounded-md border border-[var(--mkt-line)] px-1.5 py-0.5 text-2xs font-medium text-[var(--mkt-muted)]">
                    {statusBadge(track.registerState)}
                  </span>
                </div>
                <p className="text-2xs font-medium uppercase text-[var(--mkt-muted)]">
                  {HACKATHON_KIND_LABELS[track.kind]} · teams of {track.minTeamSize}–
                  {track.maxTeamSize}
                </p>
                {track.description ? (
                  <p className="line-clamp-3 text-sm text-[var(--mkt-muted)]">
                    {track.description}
                  </p>
                ) : null}
                <p className="text-sm tabular-nums text-[var(--mkt-ink)]">
                  Fee: {track.fee > 0 ? formatCurrency(track.fee, track.currency, "Free") : "Free"}
                  {track.prizePool ? ` · Prize pool ${track.prizePool}` : ""}
                </p>
                {track.discountPercent > 0 ? (
                  <p className="text-xs text-[var(--mkt-muted)]">
                    {track.discountPercent}% off
                    {track.discountNote ? ` — ${track.discountNote}` : ""}
                    {track.discountExpiresAt
                      ? ` · ends ${formatDate(track.discountExpiresAt)}`
                      : ""}
                  </p>
                ) : null}
                {track.prizes.length ? (
                  <ul className="space-y-0.5 text-xs text-[var(--mkt-ink)]">
                    {track.prizes.slice(0, 3).map((p, i) => (
                      <li key={`${p.positionLabel}-${i}`}>
                        <span className="font-medium">{p.positionLabel}</span>
                        {p.amount ? ` · ${p.amount}` : ""}
                        {p.description ? ` — ${p.description}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {track.rulesText ? (
                  <details className="rounded-lg border border-[var(--mkt-line)] bg-[var(--mkt-surface-low)] px-3 py-2 text-sm">
                    <summary className="cursor-pointer font-medium text-[var(--mkt-ink)]">
                      Rules &amp; instructions
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap text-[var(--mkt-muted)]">
                      {track.rulesText}
                    </p>
                  </details>
                ) : null}
                <p className="text-2xs font-medium uppercase text-[var(--mkt-muted)]">
                  Registration closes {closeLabel}
                </p>
                {track.registrationMessage ? (
                  <p className="text-xs text-[var(--mkt-muted)]">{track.registrationMessage}</p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {open || track.registerState === "waitlist" ? (
                    <Link href={registerHref} className={buttonClass("primary", "sm")}>
                      {registerLabel(track)}
                    </Link>
                  ) : (
                    <span
                      className={`${buttonClass("secondary", "sm")} pointer-events-none opacity-70`}
                    >
                      {registerLabel(track)}
                    </span>
                  )}
                  <Link href={detailHref} className={buttonClass("ghost", "sm")}>
                    Details
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
