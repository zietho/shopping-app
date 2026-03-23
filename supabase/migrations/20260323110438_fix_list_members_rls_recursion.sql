/*
  # Fix infinite recursion in list_members RLS policy

  ## Problem
  The SELECT policy on list_members referenced list_members itself
  causing infinite recursion. The self-referential EXISTS subquery
  was redundant — a user can always see rows where user_id = auth.uid().

  ## Changes
  - Drop and recreate the SELECT policy with a simple non-recursive check
*/

DROP POLICY IF EXISTS "Members can view their list memberships" ON list_members;

CREATE POLICY "Members can view their list memberships"
  ON list_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
