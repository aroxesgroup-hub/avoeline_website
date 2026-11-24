"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { submitPartnerApplicationAction } from "@/src/features/website/actions/contact.action";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const TRACKS = [
  { value: "campus", label: "Campus societies & universities" },
  { value: "vendor", label: "Vendors & service providers" },
  { value: "other", label: "Other / sponsorship" },
] as const;

type Track = (typeof TRACKS)[number]["value"];

export function PartnerApplicationForm({ turnstileSiteKey }: { turnstileSiteKey?: string | null }) {
  const siteKey = turnstileSiteKey?.trim() || "";
  const [track, setTrack] = useState<Track>("campus");
  const [organization, setOrganization] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [scope, setScope] = useState("");
  const [objectives, setObjectives] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const widgetHost = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !widgetHost.current) return;
    let cancelled = false;

    function mountWidget() {
      if (cancelled || !widgetHost.current || !window.turnstile) return;
      if (widgetId.current) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* ignore */
        }
        widgetId.current = null;
      }
      widgetId.current = window.turnstile.render(widgetHost.current, {
        sitekey: siteKey,
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(undefined),
        "error-callback": () => setTurnstileToken(undefined),
        theme: "auto",
      });
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );
    if (window.turnstile) {
      mountWidget();
    } else if (existing) {
      existing.addEventListener("load", mountWidget);
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", mountWidget);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, [siteKey]);

  const fieldClass =
    "h-11 w-full rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-3 text-sm text-[var(--mkt-ink)] outline-none ring-[var(--mkt-accent)] placeholder:text-[var(--mkt-muted)] focus:ring-2";
  const labelClass =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--mkt-muted)]";

  if (done) {
    return (
      <div className="mkt-card rounded-2xl p-8 text-center sm:p-10">
        <h3 className="font-display text-2xl font-semibold text-[var(--mkt-ink)]">
          Application received
        </h3>
        <p className="mt-3 text-sm text-[var(--mkt-muted)]">
          Thanks — our network team will reply from info@aroxes.com within 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="mkt-card rounded-2xl p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--mkt-ink)] sm:text-3xl">
          Join the Avoeline Partner Network
        </h2>
        <p className="mt-2 text-sm text-[var(--mkt-muted)]">
          Applications land in our inbox at info@aroxes.com. We review campus chapters and certified
          vendors with the same process.
        </p>
      </div>

      <form
        className="mx-auto mt-8 grid max-w-2xl gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const res = await submitPartnerApplicationAction({
              track,
              organization,
              name,
              email,
              region,
              scope,
              objectives,
              acceptTerms,
              website,
              turnstileToken,
            });
            if (!res.ok) {
              setError(res.error.message);
              if (widgetId.current && window.turnstile) {
                try {
                  window.turnstile.reset(widgetId.current);
                } catch {
                  /* ignore */
                }
              }
              setTurnstileToken(undefined);
              return;
            }
            setDone(true);
          });
        }}
      >
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />

        <div>
          <label className={labelClass} htmlFor="partner-track">
            Partnership track
          </label>
          <select
            id="partner-track"
            className={fieldClass}
            value={track}
            onChange={(e) => setTrack(e.target.value as Track)}
          >
            {TRACKS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="partner-org">
            Organization / society name
          </label>
          <input
            id="partner-org"
            className={fieldClass}
            required
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="partner-name">
              Point of contact full name
            </label>
            <input
              id="partner-name"
              className={fieldClass}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="partner-email">
              Official email address
            </label>
            <input
              id="partner-email"
              type="email"
              className={fieldClass}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="partner-region">
              Primary region / city
            </label>
            <input
              id="partner-region"
              className={fieldClass}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Lahore"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="partner-scope">
              Annual events or inventory scope
            </label>
            <input
              id="partner-scope"
              className={fieldClass}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="partner-objectives">
            Partnership objectives or RFQ requirements
          </label>
          <textarea
            id="partner-objectives"
            className={`${fieldClass} min-h-[120px] py-3`}
            required
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-[var(--mkt-muted)]">
          <input
            type="checkbox"
            className="mt-1"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-semibold text-[var(--mkt-accent-deep)] underline-offset-2 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and understand applications are reviewed by Avoeline / Aroxes.
          </span>
        </label>

        {siteKey ? <div ref={widgetHost} className="min-h-[65px]" /> : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="mkt-btn inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit Partner Application →"}
        </button>
      </form>
    </div>
  );
}
