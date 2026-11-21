import Link from "next/link";
import { redirect } from "next/navigation";
import { TABLES } from "@/data/collections";
import { supabaseAdmin } from "@/data/supabase";
import { AuthService } from "@/src/features/auth/authService";
import { getUserOnboarding } from "@/src/features/onboarding/onboarding.service";
import { AuthShell } from "@/src/shared_components/auth/AuthShell";
import {
  AUTH_LEFT_STATS,
  AUTH_TESTIMONIAL,
} from "@/src/shared_components/auth/authMarketingDefaults";
import { signOutAction } from "@/src/features/auth/actions/signOut.action";

export default async function AwaitingApprovalPage() {
  const user = await AuthService.getCurrentUser();
  if (!user) redirect("/auth/signin?next=/auth/signup/awaiting-approval");

  const row = await getUserOnboarding(user.userId);
  const ut = String(row?.user_type || user.userType).toLowerCase();
  const awaitingPayment = row?.onboarding_status === "awaiting_payment";
  const setupComplete =
    Boolean(row?.setup_complete) && String(row?.onboarding_status || "") === "complete";

  let reviewPending = false;
  let reviewRejected = false;

  if (ut === "organizer") {
    const { data: org } = await supabaseAdmin
      .from(TABLES.ORGANIZER_PROFILES)
      .select("review_status")
      .eq("user_id", user.userId)
      .maybeSingle();
    const review = String(org?.review_status || "approved").toLowerCase();
    reviewPending = review === "pending" || review === "flagged";
    reviewRejected = review === "rejected";
  } else if (ut === "vendor") {
    const { data: vendor } = await supabaseAdmin
      .from(TABLES.VENDOR_PROFILES)
      .select("status")
      .eq("user_id", user.userId)
      .maybeSingle();
    const status = String(vendor?.status || "pending").toLowerCase();
    const normalized = status === "active" ? "approved" : status;
    reviewPending = normalized === "pending";
    reviewRejected = normalized === "rejected";
  }

  if (setupComplete && !reviewPending && !reviewRejected && !awaitingPayment) {
    redirect(
      ut === "vendor" ? `/vendor/${user.userId}/dashboard` : `/organizer/${user.userId}/dashboard`,
    );
  }

  if (!awaitingPayment && !reviewPending && !reviewRejected) {
    redirect(ut === "vendor" ? "/auth/signup/vendorSetup" : "/auth/signup/organizerSetup");
  }

  const isProfileReview = (reviewPending || reviewRejected) && !awaitingPayment;
  const waitingOn = awaitingPayment ? "payment" : isProfileReview ? "profile" : "review";

  return (
    <AuthShell
      eyebrow={
        awaitingPayment
          ? "Payment verification"
          : reviewRejected
            ? "Application closed"
            : "Profile review"
      }
      headline={
        awaitingPayment
          ? "We’re verifying your subscription payment"
          : reviewRejected
            ? "Your application was not approved"
            : "We’re reviewing your profile"
      }
      copy={
        awaitingPayment
          ? "Your screenshot is in the queue. A platform owner confirms bank transfers — usually within 1–2 business days. You’ll get email when the plan is active."
          : reviewRejected
            ? "An administrator reviewed your account and did not approve it. Contact support if you believe this was a mistake."
            : "Free self-serve accounts need a quick profile review before the dashboard unlocks — usually 1–2 business days."
      }
      stats={[...AUTH_LEFT_STATS]}
      testimonial={AUTH_TESTIMONIAL}
    >
      <p className="rounded-lg border border-[var(--mkt-line)] bg-[var(--mkt-accent-tint)] px-3 py-2 text-xs text-[var(--mkt-muted)]">
        {waitingOn === "payment"
          ? "Status: waiting on payment approval"
          : "Status: waiting on profile approval"}
      </p>

      <div className="mt-6 space-y-3 text-sm text-[var(--mkt-muted)]">
        {awaitingPayment ? (
          <p>
            Pending plan:{" "}
            <strong className="text-[var(--mkt-ink)]">{row?.pending_plan_key || "—"}</strong>
          </p>
        ) : null}
        {isProfileReview ? (
          <p>
            Account type:{" "}
            <strong className="text-[var(--mkt-ink)]">
              {ut === "vendor" ? "Vendor" : "Organizer"}
            </strong>
          </p>
        ) : null}
        <p>
          Signed in as <strong className="text-[var(--mkt-ink)]">{user.email}</strong>
        </p>
        <p>
          Signed in with Google only?{" "}
          <Link
            href="/auth/change-password?optional=1"
            className="font-semibold text-[var(--mkt-accent-deep)] underline-offset-2 hover:underline"
          >
            Set a password
          </Link>{" "}
          so you can sign in with email next time.
        </p>
        <form action={signOutAction}>
          <button
            type="submit"
            className="font-semibold text-[var(--mkt-ink)] underline-offset-2 hover:underline"
          >
            Sign out and return later
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
