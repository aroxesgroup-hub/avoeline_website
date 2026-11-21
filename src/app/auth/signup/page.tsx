import { AuthService } from "@/src/features/auth/authService";

import { redirect } from "next/navigation";
import SignupPageClient from "./SignupPageClient";
import { CurrentUserData } from "@/src/services/models/user.type";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { logger } from "@/src/lib/logger";
import { recordConsentsAfterAuth } from "@/src/features/website/actions/consent.action";
import { mergeSignupIntent, type SignupBillingPeriod } from "@/src/features/auth/signupIntent";

function parseBilling(value?: string): SignupBillingPeriod {
  return value === "year" ? "year" : "month";
}

function parseRole(value?: string): string | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  if (lower === "organizer" || lower === "vendor" || lower === "attendee") {
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }
  if (raw === "Organizer" || raw === "Vendor" || raw === "Attendee") return raw;
  return undefined;
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; plan?: string; billing?: string }>;
}) {
  const { role, plan, billing } = await searchParams;
  const parsedRole = parseRole(role);
  const parsedBilling = parseBilling(billing);
  const parsedPlan = typeof plan === "string" && plan.trim() ? plan.trim() : undefined;

  // Do not write cookies during RSC render — only via Server Actions below / client persist.

  const handleSubmitLogin = async (formData: unknown) => {
    "use server";

    try {
      const raw = formData as Record<string, unknown>;
      const legalAccepted = Boolean(raw.legalAccepted);
      const communityOptIn = Boolean(raw.communityOptIn);
      if (!legalAccepted) {
        return {
          success: false,
          error: "You must accept the Terms and Privacy Policy to continue.",
        };
      }

      const userType = String(raw.userType ?? "attendee");
      await mergeSignupIntent({
        plan: typeof raw.plan === "string" ? raw.plan : undefined,
        billing: raw.billing === "year" ? "year" : raw.billing === "month" ? "month" : undefined,
        role: userType,
      });

      await AuthService.signUpWithEmail({
        name: String(raw.name ?? ""),
        email: String(raw.email ?? ""),
        contactNo: String(raw.contactNo ?? ""),
        gender: String(raw.gender ?? ""),
        country: String(raw.country ?? ""),
        city: String(raw.city ?? ""),
        password: String(raw.password ?? ""),
        userType,
      });
      const user: CurrentUserData | null = await AuthService.getCurrentUser();

      if (user === null) {
        redirect("/auth/signup");
      }

      const consent = await recordConsentsAfterAuth({
        email: user.email || String(raw.email || ""),
        userId: user.userId,
        role: String(user.userType || raw.userType || "attendee"),
        legalAccepted,
        communityOptIn,
        source: "signup",
      });
      if (!consent.ok) {
        logger.error("[signup] consent failed", { err: consent.error });
      }

      const nextRole = String(user.userType || "").toLowerCase();
      if (nextRole === "organizer") {
        redirect("/auth/signup/organizerSetup");
      }
      if (nextRole === "vendor") {
        redirect("/auth/signup/vendorSetup");
      }
      redirect(`/${nextRole}/${user.userId}/dashboard`);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      logger.error("[signup] failed", {
        err: error instanceof Error ? error.message : "unknown",
      });

      return {
        success: false,
        error: "Failed to setup an account. Please try again.",
      };
    }
  };

  return (
    <SignupPageClient
      handleSubmitLogin={handleSubmitLogin}
      role={parsedRole}
      plan={parsedPlan}
      billing={parsedBilling}
    />
  );
}
