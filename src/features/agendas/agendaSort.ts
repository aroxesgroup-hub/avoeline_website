import type { PublicAgendaItem } from "@/src/features/events/types";

/** Chronological day key. ISO dates sort as written; DD/MM/YYYY is normalized. */
export function compareAgendaDayKeys(a: string, b: string): number {
  return daySortKey(a).localeCompare(daySortKey(b));
}

export function comparePublicAgendaItems(
  a: Pick<PublicAgendaItem, "date" | "startTime">,
  b: Pick<PublicAgendaItem, "date" | "startTime">,
): number {
  const day = compareAgendaDayKeys(a.date || "", b.date || "");
  if (day !== 0) return day;
  return String(a.startTime || "").localeCompare(String(b.startTime || ""));
}

export function sortPublicAgendaItems<T extends { date: string; startTime: string }>(
  items: T[],
): T[] {
  return [...items].sort(comparePublicAgendaItems);
}

export function sortSessionsBySchedule<T extends { date: string; startTime: string }>(
  sessions: T[],
): T[] {
  return sortPublicAgendaItems(sessions);
}

function daySortKey(raw: string): string {
  const value = String(raw || "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const dmy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!dmy) return value;
  const day = dmy[1].padStart(2, "0");
  const month = dmy[2].padStart(2, "0");
  return `${dmy[3]}-${month}-${day}`;
}
