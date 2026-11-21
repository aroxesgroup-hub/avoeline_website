"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AuthShell } from "@/src/shared_components/auth/AuthShell";
import {
  AUTH_LEFT_STATS,
  AUTH_TESTIMONIAL,
} from "@/src/shared_components/auth/authMarketingDefaults";
import { AuthModeToggle } from "@/src/shared_components/auth/AuthModeToggle";
import { FormFeedback } from "@/src/shared_components/ui/FormFeedback";
import { Input, Button } from "@/components/ui";
import { requestPasswordResetAction } from "@/src/features/auth/actions/forgotPassword.action";

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    start(async () => {
      const r = await requestPasswordResetAction(email);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setSent(true);
    });
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      headline="Reset your password in one email."
      copy="We send a single-use link to the address on your account. It expires after a short time for security."
      stats={[...AUTH_LEFT_STATS]}
      testimonial={AUTH_TESTIMONIAL}
    >
      <AuthModeToggle mode="signin" />
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--mkt-ink)]">
          Forgot password
        </h1>
        <p className="text-sm text-[var(--mkt-muted)]">Enter the email you use for Avoeline.</p>
      </div>

      {sent ? (
        <div className="mt-6 space-y-4 text-sm text-[var(--mkt-muted)]">
          <p>
            If an account exists for <strong className="text-[var(--mkt-ink)]">{email}</strong>, we
            sent reset instructions. Check spam if nothing arrives in a few minutes.
          </p>
          <Link
            href="/auth/signin"
            className="font-semibold text-[var(--mkt-accent-deep)] underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormFeedback error={error} />
          <Input
            id="forgot-email"
            type="email"
            label="Email address"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(ev) => {
              setEmail(ev.target.value);
              if (error) setError(null);
            }}
            required
          />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={pending}>
            Send reset link
          </Button>
          <p className="text-center text-sm text-[var(--mkt-muted)]">
            Remembered it?{" "}
            <Link
              href="/auth/signin"
              className="font-semibold text-[var(--mkt-accent-deep)] underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
