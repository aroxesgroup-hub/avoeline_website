/** Pure feature-override window (docs/04 / S2). */

export function overrideLive(
  row: { expires_at?: string | null } | null | undefined,
  nowIso: string,
): boolean {
  if (!row) return false;
  return !row.expires_at || String(row.expires_at) > nowIso;
}
