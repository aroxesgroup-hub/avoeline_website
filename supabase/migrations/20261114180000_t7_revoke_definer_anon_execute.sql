-- T7: anon/authenticated must not execute destructive or privileged DEFINER RPCs
REVOKE ALL ON FUNCTION public.cleanup_is_test_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_is_test_data() FROM anon;
REVOKE ALL ON FUNCTION public.cleanup_is_test_data() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_is_test_data() TO service_role;

REVOKE ALL ON FUNCTION public.get_marketing_insights() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_marketing_insights() FROM anon;
REVOKE ALL ON FUNCTION public.get_marketing_insights() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_marketing_insights() TO service_role;

-- Helpers used by RLS stay callable by authenticated; keep anon revoked (phase1a).
REVOKE ALL ON FUNCTION public.is_platform_admin() FROM anon;
REVOKE ALL ON FUNCTION public.user_org_ids() FROM anon;
REVOKE ALL ON FUNCTION public.user_is_event_staff(uuid) FROM anon;

-- Public stats is intentionally public (aggregates only) — leave get_public_stats as-is.
