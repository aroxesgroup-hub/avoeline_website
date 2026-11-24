"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AgendaDay, Session } from "@/src/services/models/agenda.model";
import { buttonClass } from "@/src/lib/ui";

interface AgendaHeaderProps {
  id: string;
  organizer_id: string;
  days: AgendaDay[];
  sessionsByDay: Record<string, Session[]>;
  activeDate: string;
  onAdd?: () => void;
}

export default function AgendaHeader({
  days,
  sessionsByDay,
  activeDate,
  onAdd,
}: AgendaHeaderProps) {
  const searchParams = useSearchParams();

  return (
    <div className="flex w-full items-end justify-between gap-4 border-b border-line">
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
        {days.length === 0 ? (
          <p className="pb-3 text-sm text-ink-soft">No days yet — add the first session.</p>
        ) : null}
        {days.map((day, index) => {
          const isActive = activeDate === day.date;
          const sessionCount = sessionsByDay[day.date]?.length || 0;
          const params = new URLSearchParams(searchParams.toString());
          params.set("day", day.date);

          return (
            <Link
              key={day.id}
              href={`?${params.toString()}`}
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-3 pt-1 text-sm transition ${
                isActive
                  ? "border-accent font-semibold text-ink"
                  : "border-transparent font-medium text-ink-soft hover:border-line-loud hover:text-ink"
              }`}
            >
              <span>
                Day {index + 1} ({day.label})
              </span>
              {sessionCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-2xs tabular-nums ${
                    isActive ? "bg-ink text-ink-invert" : "bg-muted text-ink-soft"
                  }`}
                >
                  {sessionCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {onAdd ? (
        <div className="shrink-0 pb-2">
          <button type="button" onClick={onAdd} className={buttonClass("secondary", "sm")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </button>
        </div>
      ) : null}
    </div>
  );
}
