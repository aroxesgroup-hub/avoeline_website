/**
 * Non-production mail route (docs/25).
 * Real delivery only for EMAIL_TEST_ALLOWLIST (plus-aliases match), with a
 * [TEST] subject and MAX_REAL_EMAILS_PER_RUN. Everything else sinks.
 * Production sends as-is.
 */

type MailpitAttachment = {
  filename: string;
  content: Buffer | Uint8Array | string;
  contentType?: string;
  cid?: string;
};

export type EmailRouteDecision =
  | { route: "blocked"; reason: string }
  | {
      route: "sink";
      sink: "mailpit" | "log";
      recipients: string[];
      subject: string;
    }
  | { route: "real"; recipients: string[]; subject: string };

let realSendsThisProcess = 0;

export function decideEmailRoute(input: {
  to: string | string[];
  subject: string;
}): EmailRouteDecision {
  const recipients = normalizeList(input.to);
  const subject = String(input.subject || "");
  if ((process.env.APP_ENV || "").trim().toLowerCase() === "production") {
    return { route: "real", recipients, subject };
  }

  const allowed = parseAllowlist();
  const allAllowlisted =
    recipients.length > 0 && recipients.every((email) => isAllowlisted(email, allowed));

  if (allAllowlisted) {
    const cap = maxRealEmails();
    if (realSendsThisProcess + 1 > cap) {
      return {
        route: "blocked",
        reason: `Real email cap reached (${cap} per run)`,
      };
    }
    realSendsThisProcess += 1;
    return {
      route: "real",
      recipients,
      subject: prefixTest(subject),
    };
  }

  return {
    route: "sink",
    sink: useMailpit() ? "mailpit" : "log",
    recipients,
    subject: prefixTest(subject),
  };
}

export async function sendViaMailpit(opts: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  attachments?: MailpitAttachment[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = normalizeList(opts.to);
  if (to.length === 0) return { ok: false, error: "No recipients" };
  try {
    const nodemailer = await import("nodemailer");
    const url = process.env.MAILPIT_SMTP_URL?.trim() || "smtp://127.0.0.1:1025";
    const transporter = nodemailer.createTransport(url);
    await transporter.sendMail({
      from: "Avoeline <noreply@localhost>",
      to: to.join(", "),
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
      attachments: opts.attachments?.map((file) => ({
        filename: file.filename,
        content:
          typeof file.content === "string" || Buffer.isBuffer(file.content)
            ? file.content
            : Buffer.from(file.content),
        contentType: file.contentType,
        cid: file.cid,
      })),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Mailpit send failed" };
  }
}

/** Test hook. */
export function __resetEmailTestGuard(): void {
  realSendsThisProcess = 0;
}

function normalizeList(to: string | string[]): string[] {
  const raw = Array.isArray(to) ? to : String(to || "").split(",");
  return raw.map((item) => item.trim()).filter(Boolean);
}

function parseAllowlist(): Set<string> {
  return new Set(
    (process.env.EMAIL_TEST_ALLOWLIST || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

function plusBase(email: string): string {
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf("@");
  if (at <= 0) return lower;
  const local = lower.slice(0, at).split("+")[0];
  return `${local}@${lower.slice(at + 1)}`;
}

function isAllowlisted(email: string, list: Set<string>): boolean {
  const lower = email.trim().toLowerCase();
  if (lower.endsWith("@example.test")) return false;
  return list.has(lower) || list.has(plusBase(email));
}

function maxRealEmails(): number {
  const parsed = Number(process.env.MAX_REAL_EMAILS_PER_RUN);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 30;
}

function prefixTest(subject: string): string {
  return subject.startsWith("[TEST]") ? subject : `[TEST] ${subject}`;
}

function useMailpit(): boolean {
  if (process.env.MAILPIT_SMTP_URL?.trim()) return true;
  if ((process.env.EMAIL_TRANSPORT || "").trim().toLowerCase() === "mailpit") return true;
  return (process.env.APP_ENV || "").trim().toLowerCase() === "local";
}
