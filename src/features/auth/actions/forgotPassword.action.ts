"use server";

import { createSupabaseServer } from "@/data/supabase";
import { absoluteUrl } from "@/src/lib/appUrl";
import { rateLimit } from "@/src/lib/rateLimit";

export async function requestPasswordResetAction(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const limited = rateLimit(`forgot:${normalized}`, 5, 300);
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many reset requests. Try again in ${limited.retryAfterSec}s.`,
    };
  }

  const supabase = await createSupabaseServer();
  const redirectTo = await absoluteUrl("/auth/reset-password");
  const { error } = await supabase.auth.resetPasswordForEmail(normalized, { redirectTo });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
