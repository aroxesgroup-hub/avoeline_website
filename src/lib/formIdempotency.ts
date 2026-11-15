import "server-only";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { fail, ok, type ActionResult } from "@/src/lib/action";
import { claimClientRequestId, completeClientRequestId } from "@/src/lib/idempotency";
import { isClientRequestId } from "@/src/lib/clientRequestId";

/** Wrap a legacy FormData action so the same clientRequestId cannot double-apply. */
export async function withFormClientRequestId(
  scope: string,
  formData: FormData,
  actorUserId: string | null | undefined,
  run: () => Promise<ActionResult>,
): Promise<ActionResult> {
  const key = String(formData.get("clientRequestId") ?? "").trim();
  if (!isClientRequestId(key)) {
    return run();
  }
  const claim = await claimClientRequestId({
    scope,
    key,
    actorUserId: actorUserId || null,
  });
  if (claim.kind === "replay") {
    const replayed = claim.response as ActionResult | { success: true; redirected?: boolean };
    if (
      replayed &&
      typeof replayed === "object" &&
      "redirected" in replayed &&
      replayed.redirected
    ) {
      return ok();
    }
    return replayed as ActionResult;
  }
  if (claim.kind === "inflight") {
    return fail("That request is already being processed.");
  }
  try {
    const result = await run();
    await completeClientRequestId({ scope, key, response: result });
    return result;
  } catch (err) {
    if (isRedirectError(err)) {
      await completeClientRequestId({
        scope,
        key,
        response: { success: true, redirected: true },
      });
      throw err;
    }
    throw err;
  }
}
