-- docs/25 T0: mark seed/test rows for safe cleanup (is_test = true).
-- Default false so existing rows are production-safe.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.organizer_profiles
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.vendor_profiles
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.attendee_profiles
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.certificate_templates
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.discount_offers
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.hackathon_tracks
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.hackathon_teams
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.event_invites
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS users_is_test_idx ON public.users (is_test) WHERE is_test;
CREATE INDEX IF NOT EXISTS events_is_test_idx ON public.events (is_test) WHERE is_test;
CREATE INDEX IF NOT EXISTS registrations_is_test_idx ON public.registrations (is_test) WHERE is_test;
CREATE INDEX IF NOT EXISTS hackathon_teams_is_test_idx ON public.hackathon_teams (is_test) WHERE is_test;

-- Cleanup helper: delete test rows in FK-safe order (service role / scripts).
CREATE OR REPLACE FUNCTION public.cleanup_is_test_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.certificates WHERE is_test;
  DELETE FROM public.certificate_templates WHERE is_test;
  DELETE FROM public.discount_offers WHERE is_test;
  DELETE FROM public.event_invites WHERE is_test;
  DELETE FROM public.hackathon_teams WHERE is_test;
  DELETE FROM public.hackathon_tracks WHERE is_test;
  DELETE FROM public.registrations WHERE is_test;
  DELETE FROM public.events WHERE is_test;
  DELETE FROM public.organizer_profiles WHERE is_test;
  DELETE FROM public.vendor_profiles WHERE is_test;
  DELETE FROM public.attendee_profiles WHERE is_test;
  DELETE FROM public.organizations WHERE is_test;
  DELETE FROM public.subscription_plans WHERE is_test AND key LIKE 'test_%';
  -- users last (auth.users cleanup is script-side)
  DELETE FROM public.users WHERE is_test;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_is_test_data() FROM PUBLIC;
