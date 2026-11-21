import Link from "next/link";
import type { PublicCompetition } from "@/src/features/events/types";

/** Up to three competition cards as “featured tracks” (hackathon only). */
export function PublicFeaturedTracks({
  eventId,
  competitions,
  qsSuffix = "",
}: {
  eventId: string;
  competitions: PublicCompetition[];
  qsSuffix?: string;
}) {
  const featured = competitions.slice(0, 3);
  if (!featured.length) return null;

  return (
    <section className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
          Featured tracks
        </p>
        <h2 className="mt-1 font-display text-lg text-[var(--mkt-ink)]">
          Keynote &amp; competition tracks
        </h2>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {featured.map((track) => {
          const href = `/events/${eventId}/tracks/${track.id}${qsSuffix}`;
          return (
            <li key={track.id}>
              <Link
                href={href}
                className="mkt-card lift flex h-full flex-col rounded-2xl p-5 transition hover:border-[var(--mkt-accent)]"
              >
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mkt-accent-tint)] text-sm font-bold text-[var(--mkt-accent-deep)]">
                  {track.name.slice(0, 1).toUpperCase()}
                </span>
                <h3 className="font-display text-base font-semibold text-[var(--mkt-ink)]">
                  {track.name}
                </h3>
                {track.description ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--mkt-muted)]">
                    {track.description}
                  </p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
