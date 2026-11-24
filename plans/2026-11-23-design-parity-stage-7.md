# Stage 7 — Live scoreboard root-cause + fix + tests

**Status:** done  
**Date:** 2026-11-23

## Root cause

Live board reads `hackathon_task_completions` only. Organizer `reviewTaskSubmission` updated submissions without syncing completions; `submitTaskWork` awarded full points on submit before review.

## Shipped

1. `completionFromReview` + `reviewTaskSubmission` upserts completions (accept/reject/points, stamps `attempted_at`)
2. `submitTaskWork` writes `is_correct: false` / 0 points until review (CTF flag path unchanged)
3. `aggregateScoreboardDetailAt(..., { includeUnstamped })` — null stamps on live board only
4. Tests: `scoreboardReviewSync`, movement null-stamp, isolation tie-break + zero-point teams
5. Scoreboard page copy cleared of Stage 7 stub

## STOP

**Stage 7 STOP.** Next after approval: Stage 8 (full attendee import) → **STOP**.
