import { AuthService } from "@/src/features/auth/authService";
import { UserService, landingPathFor } from "@/src/services/user.service";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/Input";
import {
  completeForcedPasswordChange,
  completeOptionalPasswordChange,
} from "@/src/features/auth/actions/changePassword.action";
import { SubmitButton } from "@/src/shared_components/SubmitButton";
import { FormFeedback } from "@/src/shared_components/ui/FormFeedback";
import { buttonClass } from "@/src/lib/ui";
import { AuthShell } from "@/src/shared_components/auth/AuthShell";
import {
  AUTH_LEFT_STATS,
  AUTH_TESTIMONIAL,
} from "@/src/shared_components/auth/authMarketingDefaults";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; optional?: string }>;
}) {
  const current = await AuthService.getCurrentUser();
  if (!current) redirect("/auth/signin");
  const user = await UserService.getUserById(current.userId);
  const { e, optional } = await searchParams;
  const optionalMode = optional === "1";

  if (!user.mustResetPassword && !optionalMode) {
    redirect(landingPathFor(user));
  }

  const action = user.mustResetPassword
    ? completeForcedPasswordChange
    : completeOptionalPasswordChange;

  return (
    <AuthShell
      eyebrow={optionalMode ? "Optional security" : "Required step"}
      headline={
        optionalMode ? "Add a password to your account." : "Set a new password before continuing."
      }
      copy={
        optionalMode
          ? "Keep using Google on this device — a password gives you email sign-in when you need it."
          : "Your administrator created this account. Choose a password only you know before using the dashboard."
      }
      stats={[...AUTH_LEFT_STATS]}
      testimonial={AUTH_TESTIMONIAL}
    >
      <h1 className="font-display text-2xl font-bold text-[var(--mkt-ink)]">
        {optionalMode ? "Set a password" : "New password required"}
      </h1>
      <FormFeedback error={e} className="mt-4" />
      <form action={action} className="mt-4 space-y-3">
        <Input
          id="new-password"
          name="password"
          type="password"
          label="New password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Input
          id="confirm-password"
          name="confirm"
          type="password"
          label="Confirm password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <SubmitButton className={buttonClass("primary")}>Save password</SubmitButton>
      </form>
    </AuthShell>
  );
}
