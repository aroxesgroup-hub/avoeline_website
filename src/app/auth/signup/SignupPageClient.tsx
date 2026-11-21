"use client";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { FormFeedback } from "@/src/shared_components/ui/FormFeedback";
import { AuthShell } from "@/src/shared_components/auth/AuthShell";
import {
  AUTH_LEFT_STATS,
  AUTH_TESTIMONIAL,
} from "@/src/shared_components/auth/authMarketingDefaults";
import { AuthModeToggle } from "@/src/shared_components/auth/AuthModeToggle";
import { AuthEmailDivider } from "@/src/shared_components/auth/AuthEmailDivider";
import { PasswordField } from "@/src/shared_components/ui/PasswordField";
import { Button, Input, Select } from "@/components/ui";
import { GoogleAuthButton } from "@/src/features/auth/components/GoogleAuthButton";
import {
  ConsentCheckboxes,
  defaultConsentState,
} from "@/src/features/website/components/ConsentCheckboxes";
import { persistSignupIntentAction } from "@/src/features/auth/actions/persistSignupIntent.action";
import { Check, ChevronLeft } from "lucide-react";

type SignupResult = { success: boolean; error?: string } | void;

const ROLES = ["Organizer", "Vendor", "Attendee"] as const;
const PENDING_CONSENT_KEY = "avoeline_pending_consent";

function initialRole(role?: string) {
  const match = ROLES.find((r) => r.toLowerCase() === String(role ?? "").toLowerCase());
  return match ?? "Organizer";
}

function signupHref(plan?: string, billing?: string) {
  const params = new URLSearchParams();
  if (plan) params.set("plan", plan);
  if (billing) params.set("billing", billing);
  const q = params.toString();
  return q ? `/auth/signup?${q}` : "/auth/signup";
}

export default function SignupPageClient({
  handleSubmitLogin,
  role,
  plan,
  billing,
}: {
  handleSubmitLogin: (formData: unknown) => Promise<SignupResult>;
  role?: string;
  plan?: string;
  billing?: "month" | "year";
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(defaultConsentState);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNo: "",
    gender: "",
    country: "",
    city: "",
    password: "",
    userType: initialRole(role),
  });

  const billingPeriod = billing === "year" ? "year" : "month";
  const toggleHref = useMemo(() => signupHref(plan, billingPeriod), [plan, billingPeriod]);

  // Persist deep-link intent via Server Action (cannot set cookies during RSC render).
  useEffect(() => {
    void persistSignupIntentAction({
      plan,
      billing: billingPeriod,
      role: formData.userType,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync from URL props on mount / URL change
  }, [plan, billingPeriod, role]);

  function stashConsentForGoogle() {
    try {
      sessionStorage.setItem(
        PENDING_CONSENT_KEY,
        JSON.stringify({
          legalAccepted: consent.legalAccepted,
          communityOptIn: consent.communityOptIn,
          role: formData.userType,
          source: "google_signup",
        }),
      );
    } catch {
      /* ignore */
    }
  }

  const persistIntent = (userType: string) => {
    void persistSignupIntentAction({
      plan,
      billing: billingPeriod,
      role: userType,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (userType: (typeof ROLES)[number]) => {
    setFormData({ ...formData, userType });
    persistIntent(userType);
  };

  const goToCredentials = (userType: (typeof ROLES)[number]) => {
    setFormData((prev) => ({ ...prev, userType }));
    persistIntent(userType);
    setWizardStep(2);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    if (!consent.legalAccepted) {
      setError("You must accept the Terms and Privacy Policy to continue.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await persistSignupIntentAction({
        plan,
        billing: billingPeriod,
        role: formData.userType,
      });
      const res = await handleSubmitLogin({
        ...formData,
        plan,
        billing: billingPeriod,
        legalAccepted: consent.legalAccepted,
        communityOptIn: consent.communityOptIn,
      });
      if (res && !res.success) {
        setError(res.error ?? "Failed to setup an account. Please try again.");
      }
    });
  };

  return (
    <AuthShell
      eyebrow="Create an account"
      headline="One platform. The role you actually need."
      copy="Organizers run the event. Vendors bid on the work. Attendees find what is open."
      stats={[...AUTH_LEFT_STATS]}
      testimonial={AUTH_TESTIMONIAL}
    >
      <AuthModeToggle mode="signup" signupHref={toggleHref} />

      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--mkt-ink)]">
          Sign up
        </h1>
        <p className="text-sm text-[var(--mkt-muted)]">
          {wizardStep === 1
            ? "Step 1 — pick how you’ll use Avoeline."
            : "Step 2 — credentials and consent."}
        </p>
        {plan ? (
          <p className="text-xs text-[var(--mkt-muted)]">
            Plan from pricing: <span className="font-semibold text-[var(--mkt-ink)]">{plan}</span>
            {billingPeriod === "year" ? " (annual billing)" : " (monthly billing)"}
          </p>
        ) : null}
      </div>

      {wizardStep === 1 ? (
        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            {(
              [
                ["Organizer", "Create and run events", "Publishing, registrations, certificates"],
                ["Vendor", "Win bookings", "Services, quotes, and marketplace visibility"],
                ["Attendee", "Discover events", "Register, tickets, and verify passes"],
              ] as const
            ).map(([title, subtitle, detail]) => (
              <button
                key={title}
                type="button"
                onClick={() => goToCredentials(title)}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  formData.userType === title
                    ? "border-[var(--mkt-accent)] bg-[var(--mkt-accent-tint)]"
                    : "border-[var(--mkt-line)] bg-[var(--mkt-panel)] hover:border-[var(--mkt-accent)]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    formData.userType === title
                      ? "bg-[var(--mkt-accent-deep)] text-white"
                      : "bg-[var(--mkt-line)] text-[var(--mkt-muted)]"
                  }`}
                >
                  {formData.userType === title ? <Check className="h-3.5 w-3.5" /> : title[0]}
                </span>
                <span>
                  <span className="block font-semibold text-[var(--mkt-ink)]">{title}</span>
                  <span className="block text-sm text-[var(--mkt-muted)]">{subtitle}</span>
                  <span className="mt-1 block text-xs text-[var(--mkt-muted)]">{detail}</span>
                </span>
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => goToCredentials(formData.userType)}
          >
            Continue as {formData.userType}
          </Button>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]"
            onClick={() => setWizardStep(1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            Change account type
          </button>

          <div className="mt-4 space-y-4">
            <ConsentCheckboxes
              idPrefix="signup"
              legalAccepted={consent.legalAccepted}
              communityOptIn={consent.communityOptIn}
              onLegalChange={(legalAccepted) => setConsent((c) => ({ ...c, legalAccepted }))}
              onCommunityChange={(communityOptIn) => setConsent((c) => ({ ...c, communityOptIn }))}
              disabled={isPending}
            />
            <GoogleAuthButton
              label="Continue with Google"
              userType={formData.userType.toLowerCase()}
              disabled={!consent.legalAccepted}
              onBeforeStart={() => {
                stashConsentForGoogle();
                persistIntent(formData.userType);
              }}
            />
            {!consent.legalAccepted ? (
              <p className="text-xs text-[var(--mkt-muted)]">
                Accept the Terms and Privacy Policy to continue with Google.
              </p>
            ) : null}
            <AuthEmailDivider label="Or sign up with email" />
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <FormFeedback error={error} />

            <Input
              id="signup-name"
              label="Full name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Ayesha Khan"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              id="signup-email"
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              id="signup-contact"
              label="Contact number"
              type="tel"
              name="contactNo"
              autoComplete="tel"
              placeholder="+92 300 0000000"
              value={formData.contactNo}
              onChange={handleChange}
              required
            />

            <Input
              id="signup-gender"
              label="Gender (optional)"
              type="text"
              name="gender"
              placeholder="Prefer not to say"
              value={formData.gender}
              onChange={handleChange}
            />

            <PasswordField
              id="signup-password"
              name="password"
              label="Password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(password) => setFormData({ ...formData, password })}
              required
            />

            <Select
              id="signup-country"
              name="country"
              label="Country"
              autoComplete="country-name"
              value={formData.country}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select a country
              </option>
              <option value="Pakistan">Pakistan</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="India">India</option>
              <option value="Japan">Japan</option>
              <option value="Other">Other</option>
            </Select>

            <Input
              id="signup-city"
              name="city"
              label="City"
              type="text"
              autoComplete="address-level2"
              maxLength={80}
              placeholder="Lahore"
              value={formData.city}
              onChange={handleChange}
            />

            <div>
              <span className="mb-1.5 block text-2xs font-medium uppercase tracking-wider text-[var(--mkt-muted)]">
                Account type
              </span>
              <div
                className="flex w-full items-center overflow-hidden rounded-lg border border-[var(--mkt-line)] bg-[var(--mkt-panel)] p-1"
                role="group"
                aria-label="Account type"
              >
                {ROLES.map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    aria-pressed={formData.userType === roleOption}
                    onClick={() => handleRoleSelect(roleOption)}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-all duration-150 ${
                      formData.userType === roleOption
                        ? "bg-[var(--mkt-btn)] text-[var(--mkt-btn-fg)] font-semibold shadow-xs"
                        : "text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]"
                    }`}
                  >
                    {roleOption}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isPending}
              className="mt-2"
            >
              Create account
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
