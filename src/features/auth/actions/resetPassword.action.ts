"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/data/supabase";
import { AuthService } from "@/src/features/auth/authService";
import { UserService, landingPathFor } from "@/src/services/user.service";

export async function completePasswordResetAction(input: {
  password: string;
  confirm: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const current = await AuthService.getCurrentUser();
  if (!current?.userId) {
    return { ok: false, error: "Your reset link expired. Request a new one." };
  }

  const password = String(input.password ?? "");
  const confirm = String(input.confirm ?? "");
  if (password.length < 8) return { ok: false, error: "Use at least 8 characters." };
  if (password !== confirm) return { ok: false, error: "The two passwords do not match." };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };

  redirect(landingPathFor(await UserService.getUserById(current.userId)));
}
