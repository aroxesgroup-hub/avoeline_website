import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthService } from "@/src/features/auth/authService";
import { assertEventActor, assertParticipant } from "@/src/features/events/ownership";
import { assertOrganizerDriveAndGmail } from "@/src/features/connections/server/assertOrganizerDriveAndGmail";
import { createResumableSession } from "@/src/features/files/DriveStore";
import { isBlockedExecutable } from "@/src/features/files/validateUpload";
import { rateLimit } from "@/src/lib/rateLimit";
import { logger } from "@/src/lib/logger";
import type { EventFolderKind, FileCategory } from "@/src/features/files/types";

export const runtime = "nodejs";

const BodySchema = z.object({
  eventId: z.string().uuid(),
  fileName: z.string().min(1).max(200),
  mime: z.string().min(3).max(120),
  size: z
    .number()
    .int()
    .positive()
    .max(200 * 1024 * 1024),
  category: z.enum(["payment_proof", "submission", "media", "certificate", "export", "other"]),
  folderKind: z
    .enum(["payment_proofs", "certificates", "media", "exports", "submissions"])
    .optional(),
  entityType: z.string().min(1).max(64).optional(),
  entityId: z.string().min(1).max(80).optional(),
  registrationId: z.string().uuid().optional(),
  clientRequestId: z.string().uuid().optional(),
  submissionPath: z
    .object({
      competition: z.string().max(80).optional(),
      team: z.string().max(80).optional(),
    })
    .optional(),
});

function folderForCategory(category: FileCategory): EventFolderKind {
  switch (category) {
    case "payment_proof":
      return "payment_proofs";
    case "certificate":
      return "certificates";
    case "export":
      return "exports";
    case "submission":
      return "submissions";
    default:
      return "media";
  }
}

/**
 * Create a Google resumable upload session. Returns session URL only (no refresh token).
 */
export async function POST(req: NextRequest) {
  const user = await AuthService.getCurrentUser().catch(() => null);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  const limited = rateLimit(`uploads-session:${user.userId}`, 20, 60);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid upload session request." },
      { status: 400 },
    );
  }
  const input = parsed.data;
  let claimKey: string | null = null;
  if (input.clientRequestId) {
    const { claimClientRequestId } = await import("@/src/lib/idempotency");
    const claim = await claimClientRequestId({
      scope: "upload.session",
      key: input.clientRequestId,
      actorUserId: user.userId,
    });
    if (claim.kind === "replay") {
      return NextResponse.json(claim.response);
    }
    if (claim.kind === "inflight") {
      return NextResponse.json(
        { ok: false, error: "That upload request is already being processed." },
        { status: 409 },
      );
    }
    claimKey = input.clientRequestId;
  }

  if (isBlockedExecutable({ name: input.fileName, mime: input.mime })) {
    return NextResponse.json(
      { ok: false, error: "That file type is not allowed." },
      { status: 400 },
    );
  }

  let organizerId = "";
  const asStaff =
    (await assertEventActor(input.eventId, "files")) ||
    (await assertEventActor(input.eventId, "overview"));
  if (asStaff) {
    organizerId = asStaff.organizerId;
  } else if (input.registrationId) {
    const part = await assertParticipant(input.eventId, input.registrationId);
    if (!part) {
      return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
    }
    organizerId = part.event.organizerId;
  } else {
    return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
  }

  const gate = await assertOrganizerDriveAndGmail(organizerId);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error, code: gate.code }, { status: 403 });
  }

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const folderKind = input.folderKind || folderForCategory(input.category);

  try {
    const session = await createResumableSession({
      connectionId: gate.driveConnectionId,
      eventId: input.eventId,
      folderKind,
      submissionPath: input.submissionPath,
      name: input.fileName,
      mime: input.mime,
      size: input.size,
      origin,
    });

    const body = {
      ok: true as const,
      sessionUrl: session.sessionUrl,
      connectionId: gate.driveConnectionId,
      folderKind,
      meta: {
        eventId: input.eventId,
        category: input.category,
        entityType: input.entityType || "event",
        entityId: input.entityId || input.eventId,
        fileName: input.fileName,
        mime: input.mime,
        size: input.size,
      },
    };
    if (claimKey) {
      const { completeClientRequestId } = await import("@/src/lib/idempotency");
      await completeClientRequestId({ scope: "upload.session", key: claimKey, response: body });
    }
    return NextResponse.json(body);
  } catch (err) {
    logger.error("[uploads/session]", { err: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not start upload." },
      { status: 502 },
    );
  }
}
