"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { FormFeedback } from "@/src/shared_components/ui/FormFeedback";
import { AuthShell } from "@/src/shared_components/auth/AuthShell";
import {
  AUTH_LEFT_STATS,
  AUTH_TESTIMONIAL,
} from "@/src/shared_components/auth/authMarketingDefaults";
import { AuthModeToggle } from "@/src/shared_components/auth/AuthModeToggle";
import { AuthEmailDivider } from "@/src/shared_components/auth/AuthEmailDivider";
import { PasswordField } from "@/src/shared_components/ui/PasswordField";
import { Button, Input } from "@/components/ui";
import { GoogleAuthButton } from "@/src/features/auth/components/GoogleAuthButton";

interface LoginResult {
  success: boolean;
  error?: string;
}

interface SignInClientProps {
  handleEmailLogin: (email: string, password: string, next?: string) => Promise<LoginResult | void>;
}

export default function SignInClient({ handleEmailLogin }: SignInClientProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setError(null);

    startTransition(async () => {
      const next = new URLSearchParams(window.location.search).get("next") ?? "";
      const result = await handleEmailLogin(email, password, next);

      if (result && !result.success) {
        setError(result.error ?? "Failed to login. Please try again.");
      }
    });
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      headline="Pick up where the event left off."
      copy="Quotes, bookings, and analytics — one sign-in, whichever role you hold."
      stats={[...AUTH_LEFT_STATS]}
      testimonial={AUTH_TESTIMONIAL}
      heroBadge="99.9% uptime"
    >
      <AuthModeToggle mode="signin" />

      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--mkt-ink)]">
          Sign in
        </h1>
        <p className="text-sm text-[var(--mkt-muted)]">Use the email on your Avoeline account.</p>
      </div>

      <div className="mt-6 space-y-4">
        <GoogleAuthButton label="Continue with Google" />
        <AuthEmailDivider />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <FormFeedback error={error} />

        <Input
          id="signin-email"
          type="email"
          label="Email address"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          required
        />

        <div className="space-y-1">
          <div className="flex items-end justify-between gap-2">
            <span className="sr-only">Password</span>
            <Link
              href="/auth/forgot-password"
              className="ml-auto text-xs font-semibold text-[var(--mkt-accent-deep)] underline-offset-2 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordField
            id="signin-password"
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              if (error) setError(null);
            }}
            required
          />
        </div>

        <p className="rounded-lg border border-[var(--mkt-line)] bg-[var(--mkt-accent-tint)] px-3 py-2.5 text-xs text-[var(--mkt-muted)]">
          Attendee with a ticket or certificate?{" "}
          <Link
            href="/verify"
            className="font-semibold text-[var(--mkt-accent-deep)] underline-offset-2 hover:underline"
          >
            Verify your pass
          </Link>
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
          className="mt-2"
        >
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
