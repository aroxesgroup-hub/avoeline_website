/**
 * Remove is_test rows + @avoeline.test / @example.test Auth users.
 * Run: npm run cleanup:test
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { assertSafeTestTargetOrExit } from "./lib/testSafety.mjs";

config({ path: ".env.local" });
assertSafeTestTargetOrExit();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const TEST_SUFFIXES = ["@avoeline.test", "@example.test"];

async function main() {
  console.log("Cleaning is_test data…");

  // Bookings have no is_test column — tag via extra.test_seed
  const { error: bookingErr } = await admin
    .from("bookings")
    .delete()
    .filter("extra->>test_seed", "eq", "avoeline-t9");
  if (bookingErr) console.warn("bookings cleanup:", bookingErr.message);

  const { error: ovErr } = await admin.from("feature_overrides").delete().ilike("reason", "%T9%");
  if (ovErr) console.warn("feature_overrides cleanup:", ovErr.message);

  const { error: rpcErr } = await admin.rpc("cleanup_is_test_data");
  if (rpcErr) {
    console.error("cleanup_is_test_data:", rpcErr.message);
    process.exit(1);
  }
  console.log("✓ cleanup_is_test_data()");

  // Also drop T9 named plans if still present (keys not test_*)
  for (const key of ["social_lite", "partial_ops", "full"]) {
    const { error } = await admin
      .from("subscription_plans")
      .delete()
      .eq("key", key)
      .eq("is_test", true);
    if (error) console.warn(`plan ${key}:`, error.message);
  }

  let deletedAuth = 0;
  for (let page = 1; page < 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    for (const u of data.users) {
      const email = (u.email ?? "").toLowerCase();
      if (!TEST_SUFFIXES.some((s) => email.endsWith(s))) continue;
      const { error: delErr } = await admin.auth.admin.deleteUser(u.id);
      if (delErr) console.warn(`auth delete ${email}:`, delErr.message);
      else deletedAuth += 1;
    }
    if (data.users.length < 200) break;
  }
  console.log(`✓ deleted ${deletedAuth} Auth users (@avoeline.test / @example.test)`);
  console.log("Cleanup complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
