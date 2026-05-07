-- Migration: Fix Users RLS Recursion Loop
-- Created: 2026-05-07

-- 1. Drop existing recursive select and update policies on public.users
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- 2. Create recursion-free policy for users to select their own profile row
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
  );

-- 3. Create recursion-free policy for admins to select any user profile row
CREATE POLICY "users_select_admin"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (SELECT u.role FROM public.users u WHERE u.id = auth.uid()) = 'admin'
  );

-- 4. Create recursion-free policy for users to update their own profile row
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
  );

-- 5. Create recursion-free policy for admins to update any user profile row
CREATE POLICY "users_update_admin"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT u.role FROM public.users u WHERE u.id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT u.role FROM public.users u WHERE u.id = auth.uid()) = 'admin'
  );
