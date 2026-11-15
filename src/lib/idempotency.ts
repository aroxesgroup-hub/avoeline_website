import "server-only";
import { supabaseAdmin } from "@/data/supabase";
import { TABLES } from "@/data/collections";
export { isClientRequestId } from "@/src/lib/clientRequestId";

export type IdempotencyClaim =
  { kind: "fresh" } | { kind: "replay"; response: unknown } | { kind: "inflight" };

/**
 * Claim a client request id for `scope`. UNIQUE(scope, key) makes double-submit safe.
 * Returns replay payload when the same key already completed.
 */
export async function claimClientRequestId(opts: {
  scope: string;
  key: string;
  actorUserId?: string | null;
}): Promise<IdempotencyClaim> {
  const scope = opts.scope.trim().slice(0, 120);
  const key = opts.key.trim().slice(0, 128);
  if (!scope || !key) return { kind: "fresh" };

  const { data: existing } = await supabaseAdmin
    .from(TABLES.CLIENT_REQUEST_IDS)
    .select("response")
    .eq("scope", scope)
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    if (existing.response != null) {
      return { kind: "replay", response: existing.response };
    }
    return { kind: "inflight" };
  }

  const { error } = await supabaseAdmin.from(TABLES.CLIENT_REQUEST_IDS).insert({
    scope,
    key,
    actor_user_id: opts.actorUserId || null,
    response: null,
  });

  if (error) {
    // Race: another request won the unique insert
    if (error.code === "23505") {
      const { data: again } = await supabaseAdmin
        .from(TABLES.CLIENT_REQUEST_IDS)
        .select("response")
        .eq("scope", scope)
        .eq("key", key)
        .maybeSingle();
      if (again?.response != null) return { kind: "replay", response: again.response };
      return { kind: "inflight" };
    }
    throw error;
  }

  return { kind: "fresh" };
}

export async function completeClientRequestId(opts: {
  scope: string;
  key: string;
  response: unknown;
}): Promise<void> {
  const scope = opts.scope.trim().slice(0, 120);
  const key = opts.key.trim().slice(0, 128);
  if (!scope || !key) return;
  await supabaseAdmin
    .from(TABLES.CLIENT_REQUEST_IDS)
    .update({ response: opts.response as object })
    .eq("scope", scope)
    .eq("key", key);
}
