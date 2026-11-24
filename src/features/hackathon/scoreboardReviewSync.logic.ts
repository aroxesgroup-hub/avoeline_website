/** Pure helpers for Stage 7 review → scoreboard completion sync (unit-testable). */

import type { TaskSubmissionStatus } from "./taskSubmissions.types";

export type CompletionSyncPayload = {
  is_correct: boolean;
  points_awarded: number;
};

/**
 * Map organizer review status/points onto `hackathon_task_completions`.
 * Accepted awards points (review override or task max); other statuses clear the board.
 */
export function completionFromReview(input: {
  status: TaskSubmissionStatus;
  pointsAwarded: number | null | undefined;
  taskPoints: number | null | undefined;
}): CompletionSyncPayload {
  if (input.status === "accepted") {
    const raw =
      input.pointsAwarded != null && Number.isFinite(Number(input.pointsAwarded))
        ? Number(input.pointsAwarded)
        : Number(input.taskPoints ?? 0);
    const points_awarded = Math.max(0, raw);
    return { is_correct: true, points_awarded };
  }
  return { is_correct: false, points_awarded: 0 };
}
