-- T8: client request ids for mutating action idempotency (service-role only)
CREATE TABLE IF NOT EXISTS public.client_request_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  key text NOT NULL,
  actor_user_id uuid NULL REFERENCES public.users (id) ON DELETE SET NULL,
  response jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT client_request_ids_scope_key_unique UNIQUE (scope, key)
);

CREATE INDEX IF NOT EXISTS client_request_ids_created_at_idx
  ON public.client_request_ids (created_at);

ALTER TABLE public.client_request_ids ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.client_request_ids FROM PUBLIC;
REVOKE ALL ON TABLE public.client_request_ids FROM anon;
REVOKE ALL ON TABLE public.client_request_ids FROM authenticated;
GRANT ALL ON TABLE public.client_request_ids TO service_role;
