import Image from "next/image";
import type { PublicSpeaker } from "@/src/features/events/types";

export function PublicSpeakers({
  speakers,
  isHackathon = false,
}: {
  speakers: PublicSpeaker[];
  isHackathon?: boolean;
}) {
  if (!speakers.length) return null;

  return (
    <section className="space-y-6">
      <h2 className="font-display text-lg text-[var(--mkt-ink)]">
        {isHackathon ? "Distinguished industry jury & mentors" : "Verified speakers"}
      </h2>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {speakers.map((s) => (
          <li key={s.id} className="mkt-card flex gap-4 rounded-2xl p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--mkt-surface-low)]">
              {s.photoUrl ? (
                <Image src={s.photoUrl} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-lg text-[var(--mkt-muted)]">
                  {s.name.slice(0, 1) || "?"}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold text-[var(--mkt-ink)]">{s.name}</p>
              {s.title ? (
                <p className="mt-0.5 text-sm text-[var(--mkt-accent-deep)]">{s.title}</p>
              ) : null}
              {s.bio ? (
                <p className="mt-1 line-clamp-4 text-sm text-[var(--mkt-muted)]">{s.bio}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
