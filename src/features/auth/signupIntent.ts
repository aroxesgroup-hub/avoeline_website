import "server-only";

import { cookies } from "next/headers";

export const SIGNUP_INTENT_COOKIE = "avoeline_signup_intent";
const MAX_AGE_SEC = 60 * 60;

export type SignupBillingPeriod = "month" | "year";

export type SignupIntent = {
  plan?: string;
  billing?: SignupBillingPeriod;
  role?: string;
};

function parseIntent(raw: string | undefined): SignupIntent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SignupIntent;
    if (!parsed || typeof parsed !== "object") return null;
    const billing =
      parsed.billing === "year" ? "year" : parsed.billing === "month" ? "month" : undefined;
    return {
      plan: typeof parsed.plan === "string" ? parsed.plan.trim() || undefined : undefined,
      billing,
      role: typeof parsed.role === "string" ? parsed.role.trim() || undefined : undefined,
    };
  } catch {
    return null;
  }
}

export async function readSignupIntent(): Promise<SignupIntent | null> {
  const jar = await cookies();
  return parseIntent(jar.get(SIGNUP_INTENT_COOKIE)?.value);
}

export async function writeSignupIntent(intent: SignupIntent): Promise<void> {
  const jar = await cookies();
  const payload: SignupIntent = {
    plan: intent.plan?.trim() || undefined,
    billing: intent.billing === "year" ? "year" : intent.billing === "month" ? "month" : undefined,
    role: intent.role?.trim() || undefined,
  };
  if (!payload.plan && !payload.billing && !payload.role) {
    jar.delete(SIGNUP_INTENT_COOKIE);
    return;
  }
  jar.set(SIGNUP_INTENT_COOKIE, JSON.stringify(payload), {
    maxAge: MAX_AGE_SEC,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
}

export async function mergeSignupIntent(patch: SignupIntent): Promise<SignupIntent> {
  const current = (await readSignupIntent()) || {};
  const next: SignupIntent = {
    plan: patch.plan ?? current.plan,
    billing: patch.billing ?? current.billing ?? "month",
    role: patch.role ?? current.role,
  };
  await writeSignupIntent(next);
  return next;
}

export async function clearSignupIntent(): Promise<void> {
  const jar = await cookies();
  jar.delete(SIGNUP_INTENT_COOKIE);
}

export function planAmountForBilling(
  plan: { price_monthly?: number | string | null; price_yearly?: number | string | null },
  billing: SignupBillingPeriod,
): number {
  const monthly = Number(plan.price_monthly ?? 0);
  const yearly = Number(plan.price_yearly ?? 0);
  if (billing === "year" && Number.isFinite(yearly) && yearly > 0) return yearly;
  return Number.isFinite(monthly) ? monthly : 0;
}
