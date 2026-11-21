import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Verify a certificate — Avoeline",
  description: "Confirm an Avoeline certificate is genuine.",
};

export default async function VerifyIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const code = String((await searchParams)?.code ?? "").trim();
  if (code) redirect(`/verify/${encodeURIComponent(code)}`);

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-[var(--mkt-accent)]" aria-hidden />
        <h1 className="font-display text-2xl font-semibold text-[var(--mkt-ink)]">
          Verify a certificate
        </h1>
      </div>
      <p className="mt-2 text-sm text-[var(--mkt-muted)]">
        Enter the unique verification code printed on the credential.
      </p>
      <form action="/verify" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="code">
          Verification code
        </label>
        <input
          id="code"
          name="code"
          required
          placeholder="Verification code"
          className="h-11 flex-1 rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-3 text-sm"
        />
        <button type="submit" className="mkt-btn h-11 rounded-xl px-5 text-sm font-semibold">
          Verify
        </button>
      </form>
      <p className="mt-6 text-sm text-[var(--mkt-muted)]">
        <Link
          href="/events"
          className="font-semibold text-[var(--mkt-accent-deep)] hover:underline"
        >
          ← Back to events
        </Link>
      </p>
    </main>
  );
}
