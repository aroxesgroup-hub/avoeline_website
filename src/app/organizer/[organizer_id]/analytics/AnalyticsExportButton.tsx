"use client";

import { useTransition } from "react";
import { buttonClass } from "@/src/lib/ui";
import { exportAnalyticsAction } from "@/src/features/analytics/actions/exportAnalytics.action";
import type { AnalyticsFilters } from "@/src/features/analytics/analytics.filters";

export default function AnalyticsExportButton({
  organizerId,
  filters,
}: {
  organizerId: string;
  filters: AnalyticsFilters;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await exportAnalyticsAction({
            organizerId,
            range: filters.preset,
            event: filters.eventId ?? undefined,
            from: filters.from ?? undefined,
            to: filters.to ?? undefined,
          });
          if (res.ok && res.data?.url) {
            window.location.href = res.data.url;
          }
        })
      }
      className={buttonClass("primary", "md")}
    >
      Export xlsx
    </button>
  );
}
