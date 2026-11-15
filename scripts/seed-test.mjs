/**
 * T9 / docs/25 test seed — Social Lite, Partial Ops, Full + isolation peers.
 * Run: npm run seed:test
 * Password: DEMO_SEED_PASSWORD or SEED_TEST_PASSWORD (default AvoelineDemo1!)
 *
 * Fixed emails (password not printed):
 *   org.social@avoeline.test  → social_lite
 *   org.partial@avoeline.test → partial_ops
 *   org.full@avoeline.test    → full
 *   org.a@avoeline.test / org.b@avoeline.test (isolation)
 *   vendor.a@avoeline.test / vendor.b@avoeline.test
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

const PASSWORD =
  process.env.SEED_TEST_PASSWORD || process.env.DEMO_SEED_PASSWORD || "AvoelineDemo1!";
if (PASSWORD.length < 8) {
  console.error("SEED_TEST_PASSWORD / DEMO_SEED_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const TAG = "avoeline-t9";
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const FREE = [
  "events_dashboard",
  "ai_planner",
  "analytics_basic",
  "registrations",
  "access_control",
  "sponsors_basic",
  "teams_basic",
];
const PARTIAL_EXTRA = ["certificates", "hackathon_ops", "teams_advanced_roles"];
const PAID = [
  "teams_advanced_roles",
  "vendor_store",
  "certificates",
  "api_access",
  "website_builder",
  "ai_designer",
  "ushers_ops",
  "hackathon_ops",
  "sponsors_invoicing_templates",
];

/** Deterministic UUIDs for T9 matrix (documented in seed output). */
const IDS = {
  "org.social@avoeline.test": "11111111-1111-4111-8111-111111111101",
  "org.partial@avoeline.test": "11111111-1111-4111-8111-111111111102",
  "org.full@avoeline.test": "11111111-1111-4111-8111-111111111103",
  "org.a@avoeline.test": "11111111-1111-4111-8111-111111111104",
  "org.b@avoeline.test": "11111111-1111-4111-8111-111111111105",
  "vendor.a@avoeline.test": "11111111-1111-4111-8111-111111111106",
  "vendor.b@avoeline.test": "11111111-1111-4111-8111-111111111107",
};

async function throwIf(error, label) {
  if (!error) return;
  throw new Error(`${label}: ${error.message}${error.details ? ` (${error.details})` : ""}`);
}

function ymd(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function clock(h) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:00 ${ampm}`;
}

async function findAuthId(email) {
  for (let page = 1; page < 30; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function ensureAuthUser({ id, email, name }) {
  email = email.toLowerCase();
  let existingId = await findAuthId(email);
  if (existingId && existingId !== id) {
    // Prefer documented UUID; if email already maps elsewhere, reuse that id.
    id = existingId;
  }
  if (existingId) {
    const { error } = await admin.auth.admin.updateUserById(existingId, {
      password: PASSWORD,
      email_confirm: true,
      ban_duration: "none",
      user_metadata: { full_name: name },
    });
    await throwIf(error, `auth update ${email}`);
    return existingId;
  }
  const { data, error } = await admin.auth.admin.createUser({
    id,
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error) {
    // Race / id collision — fall back to email lookup after create without fixed id.
    const { data: again, error: err2 } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: name },
    });
    if (err2) {
      const recovered = await findAuthId(email);
      if (recovered) return recovered;
      await throwIf(err2, `auth create ${email}`);
    }
    return again.user.id;
  }
  return data.user.id;
}

async function ensureOrganizer({ email, name, plan, orgName }) {
  const preferred = IDS[email];
  const id = await ensureAuthUser({ id: preferred, email, name });
  const now = new Date().toISOString();
  const { error: userErr } = await admin.from("users").upsert({
    id,
    email: email.toLowerCase(),
    full_name: name,
    user_type: "organizer",
    account_status: "active",
    is_owner: false,
    must_reset_password: false,
    setup_complete: true,
    onboarding_status: "complete",
    email_verified: true,
    is_test: true,
    extra: { test_seed: TAG },
    updated_at: now,
  });
  await throwIf(userErr, `users ${email}`);
  const { error } = await admin.from("organizer_profiles").upsert({
    user_id: id,
    org_name: orgName || name,
    plan_type: plan,
    review_status: "approved",
    is_verified: true,
    is_test: true,
    username: email.split("@")[0].replace(/\./g, "_").slice(0, 32),
  });
  await throwIf(error, `organizer_profiles ${email}`);
  console.log(`✓ ${email} organizer / ${plan} → ${id}`);
  return id;
}

async function ensureVendor({ email, name, businessName }) {
  const preferred = IDS[email];
  const id = await ensureAuthUser({ id: preferred, email, name });
  const now = new Date().toISOString();
  const { error: userErr } = await admin.from("users").upsert({
    id,
    email: email.toLowerCase(),
    full_name: name,
    user_type: "vendor",
    account_status: "active",
    is_owner: false,
    must_reset_password: false,
    setup_complete: true,
    onboarding_status: "complete",
    email_verified: true,
    is_test: true,
    extra: { test_seed: TAG },
    updated_at: now,
  });
  await throwIf(userErr, `users ${email}`);
  const { error } = await admin.from("vendor_profiles").upsert({
    user_id: id,
    business_name: businessName || name,
    business_email: email.toLowerCase(),
    status: "approved",
    is_verified: true,
    is_test: true,
    service_categories: ["catering", "av", "decor"],
    plan_type: "vendor_free",
  });
  await throwIf(error, `vendor_profiles ${email}`);
  console.log(`✓ ${email} vendor → ${id}`);
  return id;
}

async function ensurePlans() {
  const rows = [
    {
      key: "social_lite",
      name: "Social Lite",
      description: "T9 free-only plan — no Vendor Store, Ushers, or AI Designer.",
      price_monthly: 0,
      price_yearly: 0,
      currency: "PKR",
      is_active: true,
      sort_order: 1,
      included_modules: [...FREE],
      audience: "organizer",
      is_test: true,
    },
    {
      key: "partial_ops",
      name: "Partial Ops",
      description:
        "T9 partial — certificates / hackathon / advanced teams; no Vendor/Ushers/Designer.",
      price_monthly: 1999,
      price_yearly: 19999,
      currency: "PKR",
      is_active: true,
      sort_order: 5,
      included_modules: [...FREE, ...PARTIAL_EXTRA],
      audience: "organizer",
      is_test: true,
    },
    {
      key: "full",
      name: "Full",
      description: "T9 full organizer modules.",
      price_monthly: 4999,
      price_yearly: 49999,
      currency: "PKR",
      is_active: true,
      sort_order: 10,
      included_modules: [...FREE, ...PAID],
      audience: "organizer",
      is_test: true,
    },
  ];
  const { error } = await admin.from("subscription_plans").upsert(rows, { onConflict: "key" });
  await throwIf(error, "subscription_plans");
  console.log("✓ plans social_lite / partial_ops / full");
}

async function ensureEvent({ organizerId, title, daysFrom = 14 }) {
  const { data: existing } = await admin
    .from("events")
    .select("id")
    .eq("organizer_id", organizerId)
    .eq("extra->>test_seed", TAG)
    .eq("title", title)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const start = ymd(daysFrom);
  const end = ymd(daysFrom + 1);
  const { data, error } = await admin
    .from("events")
    .insert({
      organizer_id: organizerId,
      title,
      short_description: `${title} — T9 isolation fixture.`,
      description: `<p>${title} is T9 seed data.</p>`,
      status: "published",
      visibility: "public",
      format: "physical",
      city: "Lahore",
      country: "Pakistan",
      venue_name: "UMT Campus",
      start_date: start,
      end_date: end,
      start_time: clock(9),
      end_time: clock(17),
      timezone: "Asia/Karachi",
      total_seats: 100,
      available_seats: 100,
      is_free: true,
      currency: "PKR",
      requires_approval: false,
      requires_registration: true,
      published_at: new Date().toISOString(),
      is_test: true,
      extra: {
        test_seed: TAG,
        schedule: {
          startDate: start,
          endDate: end,
          startTime: clock(9),
          endTime: clock(17),
          timezone: "Asia/Karachi",
        },
      },
    })
    .select("id")
    .single();
  await throwIf(error, `event ${title}`);
  return data.id;
}

async function ensureBooking({ organizerId, vendorId, eventId, label }) {
  const { data: existing } = await admin
    .from("bookings")
    .select("id")
    .eq("organizer_id", organizerId)
    .eq("vendor_id", vendorId)
    .eq("event_id", eventId)
    .maybeSingle();
  if (existing?.id) {
    console.log(`✓ booking ${label} → ${existing.id}`);
    return existing.id;
  }
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("bookings")
    .insert({
      organizer_id: organizerId,
      vendor_id: vendorId,
      event_id: eventId,
      status: "quote_requested",
      service_type: "catering",
      created_at: now,
      updated_at: now,
      extra: { test_seed: TAG, label },
    })
    .select("id")
    .single();
  await throwIf(error, `booking ${label}`);
  console.log(`✓ booking ${label} → ${data.id}`);
  return data.id;
}

async function main() {
  console.log("Seeding T9 test tenants… password is not printed.");
  await ensurePlans();

  const socialId = await ensureOrganizer({
    email: "org.social@avoeline.test",
    name: "Social Lite Org",
    plan: "social_lite",
    orgName: "Social Lite Events",
  });
  const partialId = await ensureOrganizer({
    email: "org.partial@avoeline.test",
    name: "Partial Ops Org",
    plan: "partial_ops",
    orgName: "Partial Ops Events",
  });
  const fullId = await ensureOrganizer({
    email: "org.full@avoeline.test",
    name: "Full Plan Org",
    plan: "full",
    orgName: "Full Plan Events",
  });
  const orgA = await ensureOrganizer({
    email: "org.a@avoeline.test",
    name: "Isolation Org A",
    plan: "full",
    orgName: "Isolation A",
  });
  const orgB = await ensureOrganizer({
    email: "org.b@avoeline.test",
    name: "Isolation Org B",
    plan: "full",
    orgName: "Isolation B",
  });
  const vendorA = await ensureVendor({
    email: "vendor.a@avoeline.test",
    name: "Vendor A",
    businessName: "Vendor A Catering",
  });
  const vendorB = await ensureVendor({
    email: "vendor.b@avoeline.test",
    name: "Vendor B",
    businessName: "Vendor B AV",
  });

  const eventSocial = await ensureEvent({
    organizerId: socialId,
    title: "T9 Social Lite Workshop",
    daysFrom: 21,
  });
  const eventPartial = await ensureEvent({
    organizerId: partialId,
    title: "T9 Partial Ops Summit",
    daysFrom: 28,
  });
  const eventFull = await ensureEvent({
    organizerId: fullId,
    title: "T9 Full Plan Expo",
    daysFrom: 35,
  });
  const eventA = await ensureEvent({
    organizerId: orgA,
    title: "T9 Isolation Event A",
    daysFrom: 40,
  });
  const eventB = await ensureEvent({
    organizerId: orgB,
    title: "T9 Isolation Event B",
    daysFrom: 42,
  });

  const bookingA = await ensureBooking({
    organizerId: orgA,
    vendorId: vendorA,
    eventId: eventA,
    label: "vendor-a-own",
  });
  const bookingB = await ensureBooking({
    organizerId: orgB,
    vendorId: vendorB,
    eventId: eventB,
    label: "vendor-b-own",
  });

  const summary = {
    tag: TAG,
    plans: ["social_lite", "partial_ops", "full"],
    organizers: {
      social: {
        email: "org.social@avoeline.test",
        id: socialId,
        plan: "social_lite",
        eventId: eventSocial,
      },
      partial: {
        email: "org.partial@avoeline.test",
        id: partialId,
        plan: "partial_ops",
        eventId: eventPartial,
      },
      full: { email: "org.full@avoeline.test", id: fullId, plan: "full", eventId: eventFull },
      a: { email: "org.a@avoeline.test", id: orgA, eventId: eventA },
      b: { email: "org.b@avoeline.test", id: orgB, eventId: eventB },
    },
    vendors: {
      a: { email: "vendor.a@avoeline.test", id: vendorA, bookingId: bookingA },
      b: { email: "vendor.b@avoeline.test", id: vendorB, bookingId: bookingB },
    },
  };

  console.log(JSON.stringify(summary, null, 2));
  try {
    const { mkdirSync, writeFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const outDir = join(process.cwd(), "reports", "security");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "t9-seed-summary.json"), JSON.stringify(summary, null, 2));
    console.log("✓ wrote reports/security/t9-seed-summary.json");
  } catch (err) {
    console.warn("could not write seed summary:", err.message || err);
  }
  console.log("Done. Use DEMO_SEED_PASSWORD / SEED_TEST_PASSWORD to sign in.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
