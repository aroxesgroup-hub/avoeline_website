-- T10 Batch B (SEC-006): pin search_path on private.gen_registration_short_code
-- (advisor: function_search_path_mutable).
ALTER FUNCTION private.gen_registration_short_code()
  SET search_path = private, public;
