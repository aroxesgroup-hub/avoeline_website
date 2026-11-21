"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { submitContactAction } from "@/src/features/website/actions/contact.action";
import {
  CONTACT_TOPICS,
  CONTACT_TOPIC_LABELS,
  type ContactTopic,
} from "@/src/features/website/contact.shared";

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

type Props = {
  turnstileSiteKey?: string | null;
  /** Prefill topic from `?topic=` (unknown values fall back to general). */
  initialTopic?: string | null;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-3 text-sm text-[var(--mkt-ink)] outline-none ring-[var(--mkt-accent)] placeholder:text-[var(--mkt-muted)] focus:ring-2";

function resolveTopic(raw: string | null | undefined): ContactTopic {
  const t = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (t === "enterprise" || t === "plan" || t === "plans" || t === "campus") return "sales";
  if (t === "partner" || t === "partners") return "partnership";
  if ((CONTACT_TOPICS as readonly string[]).includes(t)) return t as ContactTopic;
  return "general";
}

export function ContactForm({ turnstileSiteKey, initialTopic }: Props) {
  const siteKey = turnstileSiteKey?.trim() || "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [topic, setTopic] = useState<ContactTopic>(() => resolveTopic(initialTopic));
  const [message, setMessage] = useState("");
  const [expedited, setExpedited] = useState(false);
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const widgetHost = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    setTopic(resolveTopic(initialTopic));
  }, [initialTopic]);

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
        theme: "light",
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
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  if (done) {
    return (
      <div
        className="rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] p-6"
        role="status"
      >
        <h2 className="font-display text-xl text-[var(--mkt-ink)]">Message dispatched</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--mkt-muted)]">
          Thanks — we received your inquiry and will reply soon at the email you provided.
        </p>
      </div>
    );
  }

  return (
    <form
      className="relative space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await submitContactAction({
            name,
            email,
            organization,
            topic,
            message,
            expedited,
            website,
            turnstileToken,
          });
          if (!res.ok) {
            setError(res.error.message);
            if (widgetId.current && window.turnstile) {
              window.turnstile.reset(widgetId.current);
              setTurnstileToken(undefined);
            }
            return;
          }
          setDone(true);
        });
      }}
      noValidate
    >
      <div className="mb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
          Direct message dispatch
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--mkt-ink)]">
          Send our team an inquiry
        </h2>
      </div>

      <div className="absolute left-[-9999px] h-0 w-0 opacity-0" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium text-[var(--mkt-ink)]">
            Full name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={200}
            autoComplete="name"
            className={`${fieldClass} mt-1`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm font-medium text-[var(--mkt-ink)]">
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={320}
            autoComplete="email"
            className={`${fieldClass} mt-1`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-org" className="text-sm font-medium text-[var(--mkt-ink)]">
          Organization / university / club
        </label>
        <input
          id="contact-org"
          name="organization"
          type="text"
          maxLength={200}
          className={`${fieldClass} mt-1`}
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="contact-topic" className="text-sm font-medium text-[var(--mkt-ink)]">
          Inquiry topic
        </label>
        <select
          id="contact-topic"
          name="topic"
          className={`${fieldClass} mt-1`}
          value={topic}
          onChange={(e) => setTopic(e.target.value as ContactTopic)}
        >
          {CONTACT_TOPICS.map((t) => (
            <option key={t} value={t}>
              {CONTACT_TOPIC_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm font-medium text-[var(--mkt-ink)]">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          placeholder="Tell us about the summit dates, attendee count, ticketing tiers, or required payment settlement integrations…"
          className={`${fieldClass} mt-1 min-h-[120px] py-3`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-[var(--mkt-ink)]">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-[var(--mkt-line)]"
          checked={expedited}
          onChange={(e) => setExpedited(e.target.checked)}
        />
        <span>
          I am organizing an upcoming event in the next 60 days{" "}
          <span className="text-[var(--mkt-muted)]">(flagged for expedited verification)</span>
        </span>
      </label>

      {siteKey ? <div ref={widgetHost} className="min-h-[65px]" /> : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--mkt-btn)] px-5 text-sm font-semibold text-[var(--mkt-btn-fg)] transition hover:opacity-95 disabled:opacity-60"
        >
          <Send className="h-4 w-4" aria-hidden />
          {pending ? "Dispatching…" : "Dispatch message"}
        </button>
        <p className="text-xs text-[var(--mkt-muted)]">
          Expected reply window: under 2 hours on working agendas.
        </p>
      </div>
    </form>
  );
}
