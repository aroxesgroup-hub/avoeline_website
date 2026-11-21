"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, fieldClass, labelClass } from "@/src/lib/ui";
import { upsertSiteSettingAction } from "../../actions/settings.action";
import {
  DEFAULT_LEGAL_SUITE_SETTINGS,
  legalSuiteSettingsSchema,
  type LegalSuiteSettings,
} from "../../legalSuite.logic";

export function LegalSuiteChromePanel({ initial }: { initial: LegalSuiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<LegalSuiteSettings>(initial);

  function patch<K extends keyof LegalSuiteSettings>(key: K, value: LegalSuiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-line p-4">
      <div>
        <h3 className="font-semibold text-ink">Suite chrome</h3>
        <p className="text-sm text-ink-soft">
          Sidebar, Zero-Sell, and DPA copy for `/legal`. Document bodies are published below.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Eyebrow</label>
          <input
            className={fieldClass}
            value={form.eyebrow}
            onChange={(e) => patch("eyebrow", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Contact email</label>
          <input
            className={fieldClass}
            value={form.contactEmail}
            onChange={(e) => patch("contactEmail", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Title</label>
        <input
          className={fieldClass}
          value={form.title}
          onChange={(e) => patch("title", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Intro</label>
        <textarea
          className={`${fieldClass} min-h-20`}
          value={form.intro}
          onChange={(e) => patch("intro", e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Download button</label>
          <input
            className={fieldClass}
            value={form.downloadLabel}
            onChange={(e) => patch("downloadLabel", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Contact button</label>
          <input
            className={fieldClass}
            value={form.contactLabel}
            onChange={(e) => patch("contactLabel", e.target.value)}
          />
        </div>
      </div>

      <fieldset className="space-y-3 rounded-xl border border-line p-3">
        <legend className="px-1 text-sm font-medium text-ink">Zero-Sell panel</legend>
        <input
          className={fieldClass}
          value={form.zeroSell.title}
          onChange={(e) => patch("zeroSell", { ...form.zeroSell, title: e.target.value })}
          placeholder="Title"
        />
        <textarea
          className={`${fieldClass} min-h-20`}
          value={form.zeroSell.body}
          onChange={(e) => patch("zeroSell", { ...form.zeroSell, body: e.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={fieldClass}
            value={form.zeroSell.stat1Label}
            onChange={(e) => patch("zeroSell", { ...form.zeroSell, stat1Label: e.target.value })}
            placeholder="Stat 1 label"
          />
          <input
            className={fieldClass}
            value={form.zeroSell.stat1Value}
            onChange={(e) => patch("zeroSell", { ...form.zeroSell, stat1Value: e.target.value })}
            placeholder="Stat 1 value"
          />
          <input
            className={fieldClass}
            value={form.zeroSell.stat2Label}
            onChange={(e) => patch("zeroSell", { ...form.zeroSell, stat2Label: e.target.value })}
            placeholder="Stat 2 label"
          />
          <input
            className={fieldClass}
            value={form.zeroSell.stat2Value}
            onChange={(e) => patch("zeroSell", { ...form.zeroSell, stat2Value: e.target.value })}
            placeholder="Stat 2 value"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-line p-3">
        <legend className="px-1 text-sm font-medium text-ink">DPA CTA</legend>
        <input
          className={fieldClass}
          value={form.dpa.title}
          onChange={(e) => patch("dpa", { ...form.dpa, title: e.target.value })}
        />
        <textarea
          className={`${fieldClass} min-h-16`}
          value={form.dpa.body}
          onChange={(e) => patch("dpa", { ...form.dpa, body: e.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={fieldClass}
            value={form.dpa.buttonLabel}
            onChange={(e) => patch("dpa", { ...form.dpa, buttonLabel: e.target.value })}
          />
          <input
            className={fieldClass}
            value={form.dpa.mailtoSubject}
            onChange={(e) => patch("dpa", { ...form.dpa, mailtoSubject: e.target.value })}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-line p-3">
        <legend className="px-1 text-sm font-medium text-ink">Document nav labels</legend>
        {(["privacy", "terms", "organizer-agreement", "content-rights"] as const).map((slug) => (
          <div key={slug} className="grid gap-2 sm:grid-cols-[4rem_1fr_1fr]">
            <input
              className={fieldClass}
              type="number"
              min={1}
              max={99}
              value={form.docs[slug].index}
              onChange={(e) =>
                patch("docs", {
                  ...form.docs,
                  [slug]: { ...form.docs[slug], index: Number(e.target.value) || 1 },
                })
              }
              aria-label={`${slug} index`}
            />
            <input
              className={fieldClass}
              value={form.docs[slug].navLabel}
              onChange={(e) =>
                patch("docs", {
                  ...form.docs,
                  [slug]: { ...form.docs[slug], navLabel: e.target.value },
                })
              }
              aria-label={`${slug} nav label`}
            />
            <input
              className={fieldClass}
              value={form.docs[slug].label}
              onChange={(e) =>
                patch("docs", {
                  ...form.docs,
                  [slug]: { ...form.docs[slug], label: e.target.value },
                })
              }
              aria-label={`${slug} card label`}
            />
          </div>
        ))}
      </fieldset>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonClass("primary", "md")}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const parsed = legalSuiteSettingsSchema.safeParse(form);
              if (!parsed.success) {
                setError(parsed.error.issues[0]?.message ?? "Invalid suite settings");
                return;
              }
              const res = await upsertSiteSettingAction({
                key: "legal_suite",
                value: parsed.data,
              });
              if (!res.ok) setError(res.error.message);
              else {
                setError(null);
                setForm(parsed.data);
                router.refresh();
              }
            })
          }
        >
          Save suite chrome
        </button>
        <button
          type="button"
          className={buttonClass("secondary", "md")}
          disabled={pending}
          onClick={() => setForm(DEFAULT_LEGAL_SUITE_SETTINGS)}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
