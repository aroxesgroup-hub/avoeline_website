"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { TABLES } from "@/data/collections";
import { supabaseAdmin } from "@/data/supabase";
import { getServerEnv } from "@/src/env";
import { escapeHtml } from "@/src/lib/email";
import { sendPlatformEmail } from "@/src/lib/email/resend";
import { logger } from "@/src/lib/logger";
import { safeAction, safeFail, safeOk } from "@/src/lib/safeAction";
import {
  CONTACT_IP_HASH_FALLBACK_SALT,
  buildContactAutoReplyText,
  buildContactNotifySubject,
  buildContactNotifyText,
  checkContactRateLimit,
  hashContactIp,
  isContactHoneypotTripped,
  sanitizeContactHeader,
  scoreContactSpam,
} from "../contact.logic";

const CONTACT_INBOX = "info@aroxes.com";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200),
  email: z.string().trim().email("Enter a valid email.").max(320),
  organization: z.string().trim().max(200).optional().default(""),
  topic: z.enum(["general", "sales", "support", "partnership", "press", "other"]),
  message: z.string().trim().min(10, "Message is too short.").max(5000),
  expedited: z.boolean().optional().default(false),
  /** Honeypot — must stay empty. */
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(2048).optional(),
});

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "anon";
}

function ipHashSalt(): string {
  const env = getServerEnv();
  return (
    env.EMAIL_CONNECTION_SECRET?.trim() ||
    env.HACKATHON_COMPETE_SECRET?.trim() ||
    env.CRON_SECRET?.trim() ||
    CONTACT_IP_HASH_FALLBACK_SALT
  );
}

async function verifyTurnstile(
  token: string | undefined,
  ip: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const secret = getServerEnv().TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return { ok: true };

  if (!token?.trim()) {
    return { ok: false, message: "Please complete the captcha." };
  }

  try {
    const body = new URLSearchParams({
      secret,
      response: token.trim(),
      remoteip: ip === "anon" ? "" : ip,
    });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      logger.warn("[contact] Turnstile siteverify HTTP error", { status: res.status });
      return { ok: false, message: "Captcha verification failed. Try again." };
    }
    const data = (await res.json()) as { success?: boolean };
    if (!data.success) {
      return { ok: false, message: "Captcha verification failed. Try again." };
    }
    return { ok: true };
  } catch (err) {
    logger.error("[contact] Turnstile verify threw", {
      err: err instanceof Error ? err.message : "unknown",
    });
    return { ok: false, message: "Captcha verification failed. Try again." };
  }
}

function notifyHtml(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
  organization?: string;
  expedited?: boolean;
}): string {
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const topic = escapeHtml(input.topic);
  const org = escapeHtml(input.organization ?? "");
  const message = escapeHtml(input.message).replace(/\n/g, "<br/>");
  const expedited = input.expedited
    ? "<br/><strong>Expedited:</strong> yes (event in next 60 days)"
    : "";
  const orgLine = org ? `<br/><strong>Organization:</strong> ${org}` : "";
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
<p><strong>New contact form submission</strong></p>
<p><strong>Name:</strong> ${name}<br/>
<strong>Email:</strong> <a href="mailto:${email}">${email}</a><br/>
<strong>Topic:</strong> ${topic}${orgLine}${expedited}</p>
<p>${message}</p>
</body></html>`;
}

function autoReplyHtml(name: string): string {
  const who = escapeHtml(sanitizeContactHeader(name) || "there");
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
<p>Hi ${who},</p>
<p>Thanks for contacting Avoeline. We received your message and will reply soon.</p>
<p>— Avoeline<br/><a href="mailto:${CONTACT_INBOX}">${CONTACT_INBOX}</a></p>
</body></html>`;
}

const partnerApplicationSchema = z.object({
  track: z.enum(["campus", "vendor", "other"]),
  organization: z.string().trim().min(1, "Organization name is required.").max(200),
  name: z.string().trim().min(1, "Contact name is required.").max(200),
  email: z.string().trim().email("Enter a valid email.").max(320),
  region: z.string().trim().max(120).optional().default(""),
  scope: z.string().trim().max(500).optional().default(""),
  objectives: z.string().trim().min(10, "Tell us a bit more about your goals.").max(4000),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "Please accept the terms to continue.",
  }),
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(2048).optional(),
});

function buildPartnerMessage(input: {
  track: string;
  organization: string;
  region: string;
  scope: string;
  objectives: string;
}): string {
  return [
    `Partnership track: ${input.track}`,
    `Organization / society: ${input.organization}`,
    `Region / city: ${input.region || "—"}`,
    `Annual events or inventory scope: ${input.scope || "—"}`,
    "",
    "Objectives / RFQ requirements:",
    input.objectives,
  ].join("\n");
}

async function deliverContactSubmission(opts: {
  website?: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  organization?: string;
  expedited?: boolean;
  turnstileToken?: string;
  notifySubject?: string;
  autoSubject?: string;
}) {
  if (isContactHoneypotTripped(opts.website)) {
    return safeOk({ submitted: true as const });
  }

  const name = sanitizeContactHeader(opts.name);
  const topic = sanitizeContactHeader(opts.topic) || "general";
  const email = opts.email.trim().toLowerCase();
  const organization = sanitizeContactHeader(opts.organization ?? "");
  const expedited = Boolean(opts.expedited);
  const message = opts.message.trim();

  if (!name) return safeFail("VALIDATION", "Name is required.");

  const ip = await clientIp();
  const ipHash = hashContactIp(ip, ipHashSalt());
  const limited = checkContactRateLimit(ipHash);
  if (!limited.ok) {
    return safeFail(
      "RATE_LIMIT",
      `Too many messages. Try again in about ${limited.retryAfterSec} seconds.`,
    );
  }

  const captcha = await verifyTurnstile(opts.turnstileToken, ip);
  if (!captcha.ok) return safeFail("CAPTCHA", captcha.message);

  const spamScore = scoreContactSpam({
    honeypotTripped: false,
    message,
    name,
  });

  const { error: insertError } = await supabaseAdmin.from(TABLES.CONTACT_MESSAGES).insert({
    name,
    email,
    topic,
    message,
    organization: organization || null,
    expedited,
    status: "new",
    ip_hash: ipHash,
    spam_score: spamScore,
  });

  if (insertError) {
    logger.error("[contact] insert failed", { err: insertError.message });
    return safeFail("INTERNAL", "Could not save your message. Please try again.");
  }

  const notify = await sendPlatformEmail({
    lane: "notifications",
    to: CONTACT_INBOX,
    replyTo: email,
    subject: opts.notifySubject || buildContactNotifySubject(topic, name),
    html: notifyHtml({ name, email, topic, message, organization, expedited }),
    text: buildContactNotifyText({ name, email, topic, message, organization, expedited }),
  });

  if (!notify.ok && !notify.dryRun) {
    logger.warn("[contact] notify email failed after insert", { error: notify.error });
  }

  const auto = await sendPlatformEmail({
    lane: "notifications",
    to: email,
    subject: opts.autoSubject || "We received your message — Avoeline",
    html: autoReplyHtml(name),
    text: buildContactAutoReplyText(name),
  });

  if (!auto.ok && !auto.dryRun) {
    logger.warn("[contact] auto-reply failed", { error: auto.error });
  }

  return safeOk({ submitted: true as const });
}

export const submitContactAction = safeAction({
  input: contactSchema,
  run: async (raw) =>
    deliverContactSubmission({
      website: raw.website,
      name: raw.name,
      email: raw.email,
      organization: raw.organization,
      topic: raw.topic,
      message: raw.message,
      expedited: raw.expedited,
      turnstileToken: raw.turnstileToken,
    }),
});

export const submitPartnerApplicationAction = safeAction({
  input: partnerApplicationSchema,
  run: async (raw) => {
    const message = buildPartnerMessage({
      track: raw.track,
      organization: raw.organization,
      region: raw.region,
      scope: raw.scope,
      objectives: raw.objectives,
    });
    return deliverContactSubmission({
      website: raw.website,
      name: raw.name,
      email: raw.email,
      topic: "partnership",
      message,
      turnstileToken: raw.turnstileToken,
      notifySubject: `Partner application — ${sanitizeContactHeader(raw.organization) || "org"}`,
      autoSubject: "We received your partner application — Avoeline",
    });
  },
});
