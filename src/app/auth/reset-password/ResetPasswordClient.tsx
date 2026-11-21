"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AuthShell } from "@/src/shared_components/auth/AuthShell";
import {
  AUTH_LEFT_STATS,
  AUTH_TESTIMONIAL,
} from "@/src/shared_components/auth/authMarketingDefaults";
import { FormFeedback } from "@/src/shared_components/ui/FormFeedback";
import { PasswordField } from "@/src/shared_components/ui/PasswordField";
import { Button } from "@/components/ui";
import { completePasswordResetAction } from "@/src/features/auth/actions/resetPassword.action";

export function ResetPasswordClient({ hasSession }: { hasSession: boolean }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending || !hasSession) return;
    setError(null);
    start(async () => {
      const r = await completePasswordResetAction({ password, confirm });
      if (!r.ok) setError(r.error);
    });
  };

  return (
    <AuthShell
      eyebrow="New credentials"
      headline="Choose a password only you know."
      copy="After you save, you can sign in with email and password — or keep using Google on this device."
      stats={[...AUTH_LEFT_STATS]}
      testimonial={AUTH_TESTIMONIAL}
    >
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--mkt-ink)]">
          Set a new password
        </h1>
      </div>

      {!hasSession ? (
        <div className="mt-6 space-y-4 text-sm text-[var(--mkt-muted)]">
          <p>This reset link is missing or expired.</p>
          <Link
            href="/auth/forgot-password"
            className="font-semibold text-[var(--mkt-accent-deep)] underline-offset-4 hover:underline"
          >
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormFeedback error={error} />
          <PasswordField
            id="reset-password"
            label="New password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            required
          />
          <PasswordField
            id="reset-confirm"
            label="Confirm password"
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
            required
          />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={pending}>
            Save password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
