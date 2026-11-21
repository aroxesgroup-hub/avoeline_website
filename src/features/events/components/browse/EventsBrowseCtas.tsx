import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function EventsBrowseCtas() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="mkt-card rounded-2xl bg-[var(--mkt-accent-tint)] p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mkt-panel)] text-[var(--mkt-accent-deep)]">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--mkt-ink)]">
              Verify a certificate
            </h2>
            <p className="mt-1 text-sm text-[var(--mkt-muted)]">
              Confirm an Avoeline credential with its unique verification code.
            </p>
          </div>
        </div>
        <form action="/verify" method="get" className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="credential-code">
            Unique credential identifier
          </label>
          <input
            id="credential-code"
            name="code"
            type="text"
            required
            placeholder="Unique credential identifier"
            className="h-11 flex-1 rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-3 text-sm text-[var(--mkt-ink)] outline-none ring-[var(--mkt-accent)] placeholder:text-[var(--mkt-muted)] focus:ring-2"
          />
          <button
            type="submit"
            className="mkt-btn inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
          >
            Verify
          </button>
        </form>
        <p className="mt-3 text-xs text-[var(--mkt-muted)]">
          Or open{" "}
          <Link
            href="/verify"
            className="font-semibold text-[var(--mkt-accent-deep)] underline-offset-2 hover:underline"
          >
            /verify
          </Link>{" "}
          and paste the code there.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl bg-[var(--mkt-accent-deep)] px-6 py-8 text-white sm:px-8">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">
          Are you planning a campus event, hackathon, or conference?
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-white/75">
          <li>Zero-setup ticket tiers</li>
          <li>Instant team registrations</li>
          <li>Integrated badge / QR check-in</li>
          <li>Automated PDF certificates</li>
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex h-11 items-center rounded-xl bg-[var(--mkt-accent-soft)] px-5 text-sm font-semibold text-[var(--mkt-accent-deep)] transition hover:bg-white"
          >
            Create your event free →
          </Link>
          <Link
            href="/plans"
            className="text-sm font-semibold text-white/90 underline-offset-2 hover:underline"
          >
            Explore Organizer Plans
          </Link>
        </div>
      </section>
    </div>
  );
}
