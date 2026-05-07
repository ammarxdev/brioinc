CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.admin_users (user_id)
SELECT u.id
FROM public.users u
WHERE u.role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  );
$$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;

CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR public.is_admin()
  );

CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
  );

CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = id
    OR public.is_admin()
  );
