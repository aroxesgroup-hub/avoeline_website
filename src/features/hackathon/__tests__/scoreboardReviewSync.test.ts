import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { completionFromReview } from "../scoreboardReviewSync.logic";

describe("completionFromReview", () => {
  it("accepts with review points", () => {
    assert.deepEqual(
      completionFromReview({ status: "accepted", pointsAwarded: 40, taskPoints: 100 }),
      { is_correct: true, points_awarded: 40 },
    );
  });

  it("accepts falls back to task points when review points omitted", () => {
    assert.deepEqual(
      completionFromReview({ status: "accepted", pointsAwarded: null, taskPoints: 100 }),
      { is_correct: true, points_awarded: 100 },
    );
  });

  it("reject / submitted / late clear the board", () => {
    for (const status of ["rejected", "submitted", "late"] as const) {
      assert.deepEqual(completionFromReview({ status, pointsAwarded: 100, taskPoints: 100 }), {
        is_correct: false,
        points_awarded: 0,
      });
    }
  });

  it("clamps negative review points to zero on accept", () => {
    assert.deepEqual(
      completionFromReview({ status: "accepted", pointsAwarded: -5, taskPoints: 50 }),
      { is_correct: true, points_awarded: 0 },
    );
  });
});
