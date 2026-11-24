"use client";

import React, { useState, useTransition } from "react";
import { Terminal, Plus, Trash2, Shuffle, Box, KeyRound, Hash } from "lucide-react";
import { CTF_CATEGORIES, type CTFChallenge } from "../../types";
import { saveCTFChallengeAction, deleteCTFChallengeAction } from "../../actions/ctf.action";
import { buttonClass, fieldClass, labelClass } from "@/src/lib/ui";

export interface CTFChallengeManagerProps {
  eventId: string;
  tracks: { id: string; name: string }[];
  challenges: CTFChallenge[];
}

export function CTFChallengeManager({ eventId, tracks, challenges }: CTFChallengeManagerProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || "");
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<CTFChallenge | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success?: boolean; msg?: string } | null>(null);

  const filtered = challenges.filter((c) => {
    const trackMatch = selectedTrackId ? c.trackId === selectedTrackId : true;
    const catMatch = categoryFilter === "all" ? true : c.category === categoryFilter;
    return trackMatch && catMatch;
  });

  const handleDelete = (challengeId: string) => {
    if (!confirm("Delete this CTF challenge? Submissions and scoreboard points will be removed."))
      return;
    startTransition(async () => {
      const res = await deleteCTFChallengeAction(challengeId, eventId);
      if (res.success) {
        setFeedback({ success: true, msg: "Challenge deleted." });
      } else {
        setFeedback({ success: false, msg: res.error });
      }
    });
  };

  const handleOpenEdit = (challenge: CTFChallenge) => {
    setEditingChallenge(challenge);
    setShowForm(true);
  };

  const handleOpenNew = () => {
    setEditingChallenge(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <Terminal className="text-series-2 dark:text-series-2" size={20} />
            CTF Challenge Bank & Flags
          </h3>
          <p className="text-xs text-ink-soft">
            Configure static & dynamic flag tasks, per-task timers, randomized task pools, and
            Docker sandboxes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tracks.length > 1 ? (
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className={fieldClass}
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  Track: {t.name}
                </option>
              ))}
            </select>
          ) : null}
          <button type="button" onClick={handleOpenNew} className={buttonClass("primary", "sm")}>
            <Plus size={14} />
            New Challenge
          </button>
        </div>
      </div>

      {feedback ? (
        <div
          className={`rounded-xl p-3 text-xs font-medium ${
            feedback.success
              ? "bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary"
              : "bg-danger-soft text-danger dark:bg-danger-soft dark:text-danger-on-ink"
          }`}
        >
          {feedback.msg}
        </div>
      ) : null}

      {/* Category Pills Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
            categoryFilter === "all"
              ? "bg-ink text-white"
              : "bg-muted text-ink-soft hover:bg-muted-strong"
          }`}
        >
          All Categories ({challenges.length})
        </button>
        {CTF_CATEGORIES.map((cat) => {
          const count = challenges.filter((c) => c.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                categoryFilter === cat.id
                  ? "bg-ink text-white"
                  : "bg-muted text-ink-soft hover:bg-muted-strong"
              }`}
            >
              {cat.label} {count > 0 ? `(${count})` : ""}
            </button>
          );
        })}
      </div>

      {/* Create / Edit Form Modal */}
      {showForm ? (
        <div className="rounded-2xl border border-accent-line bg-accent-soft p-5 dark:border-accent-line dark:bg-accent-soft">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h4 className="font-bold text-ink">
              {editingChallenge ? `Edit Challenge: ${editingChallenge.title}` : "Add CTF Challenge"}
            </h4>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>

          <form
            action={async (formData) => {
              formData.set("trackId", selectedTrackId || tracks[0]?.id || "");
              if (editingChallenge) formData.set("id", editingChallenge.id);
              const res = await saveCTFChallengeAction(eventId, formData);
              if (res.success) {
                setShowForm(false);
                setFeedback({ success: true, msg: "Challenge saved successfully!" });
              } else {
                setFeedback({ success: false, msg: res.error });
              }
            }}
            className="mt-4 space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Challenge Title *</label>
                <input
                  name="title"
                  defaultValue={editingChallenge?.title || ""}
                  required
                  placeholder="e.g. SQL Injection Infiltration"
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Category *</label>
                <select
                  name="category"
                  defaultValue={editingChallenge?.category || "web"}
                  className={fieldClass}
                >
                  {CTF_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Challenge Description & Scenario</label>
              <textarea
                name="description"
                defaultValue={editingChallenge?.description || ""}
                rows={3}
                placeholder="Describe the target machine, vulnerability, or mission objective..."
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Points Value</label>
                <input
                  name="points"
                  type="number"
                  defaultValue={editingChallenge?.points ?? 100}
                  min={10}
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Per-Task Timer (Minutes)</label>
                <input
                  name="timeLimitMinutes"
                  type="number"
                  defaultValue={editingChallenge?.timeLimitMinutes ?? ""}
                  placeholder="Blank = Unlimited"
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Random Pool Tag (Optional)</label>
                <input
                  name="randomPoolTag"
                  defaultValue={editingChallenge?.randomPoolTag || ""}
                  placeholder="e.g. pool_web_easy"
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Flag Configuration */}
            <div className="rounded-xl border border-line bg-paper p-4">
              <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Flag Verification Mode
              </h5>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Flag Checking Method</label>
                  <select
                    name="flagType"
                    defaultValue={editingChallenge?.flagType || "static"}
                    className={fieldClass}
                  >
                    <option value="static">Static Flag (Exact string match)</option>
                    <option value="dynamic">Dynamic Flag (Salted HMAC hash per team)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Static Flag String</label>
                  <input
                    name="staticFlag"
                    defaultValue={editingChallenge?.staticFlag || ""}
                    placeholder="FLAG{hack_the_planet_2026}"
                    className={fieldClass}
                  />
                  <span className="text-2xs text-ink-soft">
                    Leave blank if using dynamic team-salted flags.
                  </span>
                </div>
              </div>
            </div>

            {/* Docker Sandbox Option */}
            <div className="rounded-xl border border-line bg-paper p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="text-series-2" size={16} />
                  <div>
                    <span className="text-xs font-bold text-ink">
                      Docker Sandbox Machine (Premium)
                    </span>
                    <p className="text-2xs text-ink-soft">
                      Spawns an isolated exploitable container per team with private ports &
                      credentials.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="requiresDocker"
                  value="true"
                  defaultChecked={editingChallenge?.requiresDocker || false}
                  className="h-4 w-4 rounded accent-primary"
                />
              </div>
              <div className="mt-3">
                <input
                  name="dockerImage"
                  defaultValue={
                    editingChallenge?.dockerImage || "ghcr.io/avoeline/ctf-web-sqli:latest"
                  }
                  placeholder="Docker image registry URI"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={buttonClass("ghost", "sm")}
              >
                Cancel
              </button>
              <button type="submit" disabled={isPending} className={buttonClass("primary", "sm")}>
                {isPending ? "Saving..." : "Save Challenge"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Challenges Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-paper p-8 text-center">
          <Terminal className="mx-auto text-ink-faint mb-2" size={32} />
          <h4 className="font-semibold text-ink">No challenges yet</h4>
          <p className="text-xs text-ink-soft mt-1">
            Create your first CTF challenge to populate the arena for this track.
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            className={`mt-4 ${buttonClass("primary", "sm")}`}
          >
            <Plus size={14} /> Add Challenge
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-paper shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-muted/40 text-ink-soft">
              <tr>
                <th className="p-3.5 font-semibold">Title</th>
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Points</th>
                <th className="p-3.5 font-semibold">Flag Type</th>
                <th className="p-3.5 font-semibold">Sandbox</th>
                <th className="p-3.5 font-semibold">Solves</th>
                <th className="p-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {filtered.map((challenge) => (
                <tr key={challenge.id} className="hover:bg-muted/20 transition">
                  <td className="p-3.5">
                    <span className="font-semibold text-ink">{challenge.title}</span>
                    {challenge.randomPoolTag ? (
                      <span className="ml-2 inline-flex items-center gap-1 rounded bg-accent-soft px-1.5 py-0.5 text-2xs text-series-2 dark:bg-accent-soft dark:text-series-2">
                        <Shuffle size={10} /> {challenge.randomPoolTag}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3.5">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-medium uppercase text-2xs">
                      {challenge.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-semibold">{challenge.points} pts</td>
                  <td className="p-3.5">
                    {challenge.flagType === "dynamic" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-2xs font-semibold text-series-3 dark:bg-accent-soft dark:text-series-3">
                        <Hash size={11} /> Dynamic Salt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-2xs font-semibold text-series-2 dark:bg-accent-soft dark:text-series-2">
                        <KeyRound size={11} /> Static
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {challenge.requiresDocker ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2 py-0.5 text-2xs font-semibold text-primary dark:bg-primary-soft dark:text-primary">
                        <Box size={11} /> Docker VM
                      </span>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono font-medium">{challenge.solveCount}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(challenge)}
                        className="font-medium text-series-2 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(challenge.id)}
                        className="text-danger hover:text-danger"
                        title="Delete challenge"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
