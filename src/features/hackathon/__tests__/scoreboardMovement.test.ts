import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateScoreboardDetailAt,
  computeRankMovement,
  withRankMovement,
  type ScoreboardDetailRow,
} from "../scoreboardAggregate";

const base = {
  teams: [
    { id: "a", name: "Alpha" },
    { id: "b", name: "Beta" },
    { id: "c", name: "Gamma" },
  ],
  taskRows: [
    { id: "t1", title: "One", points: 100, phase_id: null },
    { id: "t2", title: "Two", points: 50, phase_id: null },
  ],
  phaseRows: [] as { id: string; name: string }[],
};

describe("scoreboard rank movement", () => {
  it("filters completions by attempted_at cutoff", () => {
    const now = Date.parse("2026-11-08T12:00:00Z");
    const hourAgo = now - 3_600_000;
    const rows = aggregateScoreboardDetailAt(
      {
        ...base,
        completions: [
          {
            hackathon_team_id: "a",
            task_id: "t1",
            points_awarded: 100,
            is_correct: true,
            attempted_at: new Date(hourAgo - 60_000).toISOString(),
          },
          {
            hackathon_team_id: "b",
            task_id: "t1",
            points_awarded: 100,
            is_correct: true,
            attempted_at: new Date(now - 60_000).toISOString(),
          },
        ],
      },
      hourAgo,
    );
    assert.equal(rows[0]?.teamId, "a");
    assert.equal(rows.find((r) => r.teamId === "b")?.points, 0);
  });

  it("marks up / down / same / new vs hour-ago board", () => {
    const now = Date.parse("2026-11-08T12:00:00Z");
    const input = {
      ...base,
      completions: [
        {
          hackathon_team_id: "a",
          task_id: "t1",
          points_awarded: 100,
          is_correct: true,
          attempted_at: new Date(now - 2 * 3_600_000).toISOString(),
        },
        {
          hackathon_team_id: "b",
          task_id: "t2",
          points_awarded: 50,
          is_correct: true,
          attempted_at: new Date(now - 2 * 3_600_000).toISOString(),
        },
        {
          hackathon_team_id: "b",
          task_id: "t1",
          points_awarded: 100,
          is_correct: true,
          attempted_at: new Date(now - 30_000).toISOString(),
        },
        {
          hackathon_team_id: "c",
          task_id: "t2",
          points_awarded: 50,
          is_correct: true,
          attempted_at: new Date(now - 10_000).toISOString(),
        },
      ],
    };
    const withMove = withRankMovement(input, now);
    const byId = new Map(withMove.map((r) => [r.teamId, r]));
    // Hour ago: A=100 (#1), B=50 (#2), C=0 (#3). Now: B=150 (#1), A=100 (#2), C=50 (#3).
    assert.equal(byId.get("b")?.movement?.direction, "up");
    assert.equal(byId.get("a")?.movement?.direction, "down");
    assert.equal(byId.get("c")?.movement?.direction, "same");

    const move = computeRankMovement(withMove, aggregateScoreboardDetailAt(input, now - 3_600_000));
    assert.equal(move.get("b")?.direction, "up");
    assert.ok((move.get("b")?.delta ?? 0) > 0);
  });

  it("marks a team missing from the earlier board as new", () => {
    const move = computeRankMovement([{ teamId: "newcomer" } as ScoreboardDetailRow], []);
    assert.equal(move.get("newcomer")?.direction, "new");
    assert.equal(move.get("newcomer")?.priorRank, null);
  });

  it("null attempted_at counts on now board but not hour-ago cutoffs", () => {
    const now = Date.parse("2026-11-08T12:00:00Z");
    const input = {
      ...base,
      completions: [
        {
          hackathon_team_id: "a",
          task_id: "t1",
          points_awarded: 100,
          is_correct: true,
          attempted_at: null,
        },
        {
          hackathon_team_id: "b",
          task_id: "t2",
          points_awarded: 50,
          is_correct: true,
          attempted_at: new Date(now - 2 * 3_600_000).toISOString(),
        },
      ],
    };
    assert.equal(
      aggregateScoreboardDetailAt(input, now, { includeUnstamped: true })[0]?.teamId,
      "a",
    );
    assert.equal(
      aggregateScoreboardDetailAt(input, now - 3_600_000, { includeUnstamped: false }).find(
        (r) => r.teamId === "a",
      )?.points,
      0,
    );
    // Unstamped rows look like a recent gain vs hour-ago (0 → 100); review/judge paths stamp attempted_at.
    const withMove = withRankMovement(input, now);
    assert.equal(withMove.find((r) => r.teamId === "a")?.movement?.direction, "up");
    assert.equal(withMove.find((r) => r.teamId === "b")?.movement?.direction, "down");
  });
});
