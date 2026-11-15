import type { z } from "zod";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { logger } from "@/src/lib/logger";
import {
  claimClientRequestId,
  completeClientRequestId,
  isClientRequestId,
} from "@/src/lib/idempotency";

/**
 * C2 action result. New actions should return this shape.
 * Legacy `{ success, error? }` in `action.ts` remains until call sites migrate.
 */
export type SafeActionResult<T = void> =
  { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

export function safeOk<T>(data: T): SafeActionResult<T> {
  return { ok: true, data };
}

export function safeFail(code: string, message: string): SafeActionResult<never> {
  return { ok: false, error: { code, message } };
}

export type SafeActionAuthContext = {
  userId?: string;
  /** Optional labels for logs (never secrets). */
  label?: string;
};

type IdempotencyConfig<TInput> = {
  scope: string;
  /** Extract stable client request id from parsed input. */
  keyFrom: (input: TInput) => string | null | undefined;
};

type SafeActionConfig<TSchema extends z.ZodType, TData, TAuth> = {
  input: TSchema;
  /** Return auth context or a SafeActionResult failure. */
  auth?: () => Promise<TAuth | SafeActionResult<never>>;
  run: (input: z.infer<TSchema>, auth: TAuth) => Promise<SafeActionResult<TData> | TData>;
  /** When set, duplicate clientRequestId replays the first response. */
  idempotency?: IdempotencyConfig<z.infer<TSchema>>;
};

function isResult<T>(value: unknown): value is SafeActionResult<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    typeof (value as SafeActionResult<T>).ok === "boolean"
  );
}

/**
 * One action pattern (ENGINEERING_RULES C2): zod input → optional auth → run.
 * Catches unexpected errors and returns a generic client message.
 */
export function safeAction<TSchema extends z.ZodType, TData = void, TAuth = void>(
  config: SafeActionConfig<TSchema, TData, TAuth>,
): (raw: unknown) => Promise<SafeActionResult<TData>> {
  return async (raw: unknown): Promise<SafeActionResult<TData>> => {
    const parsed = config.input.safeParse(raw);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input.";
      return safeFail("VALIDATION", message);
    }

    let auth = undefined as TAuth;
    if (config.auth) {
      const authResult = await config.auth();
      if (isResult<never>(authResult)) return authResult;
      auth = authResult;
    }

    const idem = config.idempotency;
    let claimKey: string | null = null;
    if (idem) {
      const key = idem.keyFrom(parsed.data);
      if (key && isClientRequestId(key)) {
        claimKey = key.trim();
        const actorUserId = (auth as SafeActionAuthContext | undefined)?.userId;
        const claim = await claimClientRequestId({
          scope: idem.scope,
          key: claimKey,
          actorUserId,
        });
        if (claim.kind === "replay") {
          return claim.response as SafeActionResult<TData>;
        }
        if (claim.kind === "inflight") {
          return safeFail("IDEMPOTENT_INFLIGHT", "That request is already being processed.");
        }
      }
    }

    try {
      const out = await config.run(parsed.data, auth);
      const result = isResult<TData>(out) ? out : safeOk(out as TData);
      if (idem && claimKey) {
        await completeClientRequestId({
          scope: idem.scope,
          key: claimKey,
          response: result,
        });
      }
      return result;
    } catch (err) {
      // next/navigation redirect() throws a special error that must propagate.
      if (isRedirectError(err)) throw err;
      logger.error("[safeAction]", {
        label: (auth as SafeActionAuthContext | undefined)?.label,
        err: err instanceof Error ? err.message : "unknown",
      });
      return safeFail("INTERNAL", "Something went wrong. Please try again.");
    }
  };
}

/** Bridge C2 → legacy ActionResult for forms still on `{ success, error? }`. */
export function toLegacyResult(result: SafeActionResult<unknown>): {
  success: boolean;
  error?: string;
} {
  if (result.ok) return { success: true };
  return { success: false, error: result.error.message };
}
