/** Pure helpers for certificate recipient presets (issue UI). */

export type RankedTeamMember = {
  registrationId: string;
  teamName: string;
  competitionName?: string;
  rank: number;
  points: number;
};

function teamPoints(scores: unknown): number {
  if (!scores || typeof scores !== "object") return 0;
  let total = 0;
  for (const byRound of Object.values(scores as Record<string, unknown>)) {
    if (!byRound || typeof byRound !== "object") continue;
    for (const card of Object.values(byRound as Record<string, unknown>)) {
      if (card && typeof card === "object" && "total" in card) {
        total += Number((card as { total: unknown }).total) || 0;
      }
    }
  }
  return total;
}

/**
 * Rank hackathon teams by judge score totals (desc), then expand members
 * so each person gets their own certificate row.
 */
export function rankTeamMembersForCertificates(
  teams: Array<{
    id: string;
    name: string;
    trackId?: string;
    trackName?: string;
    scores?: unknown;
    memberRegistrationIds?: string[];
    members?: Array<{ registrationId: string }>;
  }>,
): RankedTeamMember[] {
  const ranked = [...teams]
    .map((t) => ({
      teamName: t.name || "Team",
      competitionName: t.trackName || "",
      points: teamPoints(t.scores),
      memberIds: [
        ...(t.memberRegistrationIds || []),
        ...(t.members || []).map((m) => m.registrationId),
      ].filter(Boolean),
    }))
    .sort((a, b) => b.points - a.points || a.teamName.localeCompare(b.teamName));

  const out: RankedTeamMember[] = [];
  ranked.forEach((t, idx) => {
    const rank = idx + 1;
    const seen = new Set<string>();
    for (const rid of t.memberIds) {
      if (seen.has(rid)) continue;
      seen.add(rid);
      out.push({
        registrationId: rid,
        teamName: t.teamName,
        competitionName: t.competitionName || undefined,
        rank,
        points: t.points,
      });
    }
  });
  return out;
}

/** Top-N ranks (1..n) registration ids. */
export function winnerRegistrationIds(ranked: RankedTeamMember[], topN = 3): string[] {
  const n = Math.max(1, topN);
  return ranked.filter((r) => r.rank <= n).map((r) => r.registrationId);
}
