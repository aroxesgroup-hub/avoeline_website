"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  ANALYTICS_PRESETS,
  PRESET_LABELS,
  analyticsHref,
  type AnalyticsFilters,
  type AnalyticsPreset,
} from "@/src/features/analytics/analytics.filters";
import { buttonClass, fieldClass, labelClass } from "@/src/lib/ui";
import { Card, CardBody } from "@/src/shared_components/ui/Card";

export default function AnalyticsFiltersBar({
  basePath,
  filters,
  eventOptions,
  rangeLabel,
}: {
  basePath: string;
  filters: AnalyticsFilters;
  eventOptions: { id: string; title: string }[];
  rangeLabel: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function go(overrides: Partial<AnalyticsFilters>) {
    router.push(analyticsHref(basePath, filters, overrides));
  }

  return (
    <Card tone="flat">
      <CardBody className="space-y-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Date range">
          {ANALYTICS_PRESETS.filter((p) => p !== "custom").map((p) => (
            <Link
              key={p}
              href={analyticsHref(basePath, filters, {
                preset: p as AnalyticsPreset,
                from: null,
                to: null,
              })}
              className={buttonClass(filters.preset === p ? "primary" : "secondary", "sm")}
            >
              {PRESET_LABELS[p]}
            </Link>
          ))}
          <button
            type="button"
            className={buttonClass(filters.preset === "custom" ? "primary" : "secondary", "sm")}
            onClick={() => go({ preset: "custom" })}
          >
            Custom
          </button>
        </div>

        {filters.preset === "custom" ? (
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              go({
                preset: "custom",
                from: String(fd.get("from") || "") || null,
                to: String(fd.get("to") || "") || null,
              });
            }}
          >
            <label className={labelClass}>
              From
              <input
                name="from"
                type="date"
                defaultValue={filters.from ?? ""}
                className={`${fieldClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              To
              <input
                name="to"
                type="date"
                defaultValue={filters.to ?? ""}
                className={`${fieldClass} mt-1`}
              />
            </label>
            <button type="submit" className={buttonClass("primary", "sm")}>
              Apply
            </button>
          </form>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <label className={labelClass}>
            Event
            <select
              className={`${fieldClass} mt-1 max-w-xs`}
              value={filters.eventId ?? "all"}
              onChange={(e) => {
                const v = e.target.value;
                startTransition(() => go({ eventId: v === "all" ? null : v }));
              }}
            >
              <option value="all">All events</option>
              {eventOptions.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </label>
          <p className="pt-5 text-sm text-ink-soft tabular-nums">{rangeLabel}</p>
        </div>
      </CardBody>
    </Card>
  );
}
