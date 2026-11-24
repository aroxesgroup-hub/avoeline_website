import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aggregateScoreboardDetail } from "../scoreboardAggregate";

describe("scoreboard track isolation", () => {
  it("ranks zero-point teams and applies tie-break: points → solved → earlier last solve", () => {
    const board = aggregateScoreboardDetail({
      teams: [
        { id: "a", name: "Alpha" },
        { id: "b", name: "Beta" },
        { id: "c", name: "Gamma" },
        { id: "z", name: "Zero" },
      ],
      taskRows: [
        { id: "t1", title: "One", points: 50, phase_id: null },
        { id: "t2", title: "Two", points: 50, phase_id: null },
      ],
      phaseRows: [],
      completions: [
        {
          hackathon_team_id: "a",
          task_id: "t1",
          points_awarded: 50,
          is_correct: true,
          attempted_at: "2026-10-01T12:00:00.000Z",
        },
        {
          hackathon_team_id: "a",
          task_id: "t2",
          points_awarded: 50,
          is_correct: true,
          attempted_at: "2026-10-01T13:00:00.000Z",
        },
        {
          hackathon_team_id: "b",
          task_id: "t1",
          points_awarded: 100,
          is_correct: true,
          attempted_at: "2026-10-01T14:00:00.000Z",
        },
        {
          hackathon_team_id: "c",
          task_id: "t1",
          points_awarded: 100,
          is_correct: true,
          attempted_at: "2026-10-01T11:00:00.000Z",
        },
      ],
    });
    // A=100 (2 solved), B=100 (1), C=100 (1, earlier) → A first; C before B on lastSolve; Z last at 0
    assert.equal(board.map((r) => r.teamId).join(","), "a,c,b,z");
    assert.equal(board.find((r) => r.teamId === "z")?.points, 0);
  });

  it("does not count completions from another competition's tasks", () => {
    const trackATasks = [
      { id: "task-a1", title: "A1", points: 100, phase_id: null },
      { id: "task-a2", title: "A2", points: 50, phase_id: null },
    ];
    const trackBTasks = [{ id: "task-b1", title: "B1", points: 200, phase_id: null }];

    const teamsA = [{ id: "team-a", name: "Alpha", extra: {} }];
    const completions = [
      {
        hackathon_team_id: "team-a",
        task_id: "task-a1",
        points_awarded: 100,
        is_correct: true,
        attempted_at: "2026-10-01T10:00:00.000Z",
      },
      // Foreign competition task — must not affect track A board
      {
        hackathon_team_id: "team-a",
        task_id: "task-b1",
        points_awarded: 200,
        is_correct: true,
        attempted_at: "2026-10-01T11:00:00.000Z",
      },
    ];

    const boardA = aggregateScoreboardDetail({
      teams: teamsA,
      taskRows: trackATasks,
      phaseRows: [],
      completions,
    });
    assert.equal(boardA[0]?.points, 100);
    assert.equal(boardA[0]?.solved, 1);

    const boardB = aggregateScoreboardDetail({
      teams: [{ id: "team-b", name: "Beta", extra: {} }],
      taskRows: trackBTasks,
      phaseRows: [],
      completions: [
        {
          hackathon_team_id: "team-b",
          task_id: "task-b1",
          points_awarded: 200,
          is_correct: true,
          attempted_at: "2026-10-01T12:00:00.000Z",
        },
        {
          hackathon_team_id: "team-b",
          task_id: "task-a1",
          points_awarded: 100,
          is_correct: true,
          attempted_at: "2026-10-01T12:30:00.000Z",
        },
      ],
    });
    assert.equal(boardB[0]?.points, 200);
    assert.equal(boardB[0]?.solved, 1);
  });
});
