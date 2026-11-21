"use server";

import { mergeSignupIntent, type SignupBillingPeriod } from "@/src/features/auth/signupIntent";

export async function persistSignupIntentAction(input: {
  plan?: string;
  billing?: string;
  role?: string;
}): Promise<{ ok: true }> {
  const billing: SignupBillingPeriod | undefined =
    input.billing === "year" ? "year" : input.billing === "month" ? "month" : undefined;
  await mergeSignupIntent({
    plan: input.plan,
    billing,
    role: input.role,
  });
  return { ok: true };
}
