/** Pure plan + override resolution (docs/04 / T9). Mirrors hasModuleAccess. */

export type OverrideRow = {
  expires_at?: string | null;
  denied?: boolean | null;
  target_org_id?: string | null;
};

export type ResolveModuleAccessInput = {
  nowIso: string;
  /** Personal feature_overrides for this organizer + module. */
  personalOverrides: OverrideRow[];
  /** Org-targeted overrides for this module (any org). Filtered by profileOrgId. */
  orgOverrides: OverrideRow[];
  profileOrgId?: string | null;
  /** Club / org module access rows that already match this module. */
  clubAccessEnabled: boolean;
  planIncludedModules: string[] | null | undefined;
  planIsActive: boolean | null | undefined;
  moduleKey: string;
  /** When true, overrideLive is injected for tests. */
  overrideLive: (row: OverrideRow, nowIso: string) => boolean;
};

/**
 * Precedence: deny → grant (personal) → org deny → org grant → club org_module_access → plan.
 * Inactive plan → false (after overrides/club).
 */
export function resolveModuleAccessFromRows(input: ResolveModuleAccessInput): boolean {
  const {
    nowIso,
    personalOverrides,
    orgOverrides,
    profileOrgId,
    clubAccessEnabled,
    planIncludedModules,
    planIsActive,
    moduleKey,
    overrideLive,
  } = input;

  if (!moduleKey) return false;

  const live = personalOverrides.filter((row) => overrideLive(row, nowIso));
  if (live.some((row) => row.denied)) return false;
  if (live.some((row) => !row.denied)) return true;

  const orgLive = orgOverrides.filter(
    (row) => row.target_org_id === profileOrgId && overrideLive(row, nowIso),
  );
  if (orgLive.some((row) => row.denied)) return false;
  if (orgLive.some((row) => !row.denied)) return true;

  if (clubAccessEnabled) return true;

  if (planIsActive === false) return false;
  const included = planIncludedModules ?? [];
  return included.includes(moduleKey);
}
