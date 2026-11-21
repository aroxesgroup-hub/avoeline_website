"use client";

import { useEffect } from "react";

export function LegalSuitePrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="mkt-btn w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition"
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}

export function LegalSuiteScrollToActive({ activeSlug }: { activeSlug?: string | null }) {
  useEffect(() => {
    if (!activeSlug) return;
    const el = document.getElementById(activeSlug);
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [activeSlug]);
  return null;
}
