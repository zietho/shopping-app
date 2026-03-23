/*
  # Fix RLS Performance, Indexes, and Security Issues

  1. RLS Policy Fixes
    - Replace bare auth.uid() with (select auth.uid()) in all policies for
      list_members, share_invites, lists, and items tables
    - Fix the always-true USING clause on "Users can redeem invites" UPDATE policy
      so it only allows updating unexpired, unused invites

  2. Index Changes
    - Add missing covering indexes on share_invites(created_by) and share_invites(used_by)
    - Drop confirmed unused indexes to reduce write overhead

  3. Security Fix
    - "Users can redeem invites" UPDATE policy USING clause changed from `true`
      to check that the invite is unused and not expired
*/

-- ============================================================
-- list_members
-- ============================================================

DROP POLICY IF EXISTS "Members can view their list memberships" ON list_members;
DROP POLICY IF EXISTS "Users can join lists" ON list_members;
DROP POLICY IF EXISTS "Owners or self can delete membership" ON list_members;

CREATE POLICY "Members can view their list memberships"
  ON list_members FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can join lists"
  ON list_members FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Owners or self can delete membership"
  ON list_members FOR DELETE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM list_members lm2
      WHERE lm2.list_id = list_members.list_id
        AND lm2.user_id = (select auth.uid())
        AND lm2.role = 'owner'
    )
  );

-- ============================================================
-- lists
-- ============================================================

DROP POLICY IF EXISTS "Members can view their lists" ON lists;
DROP POLICY IF EXISTS "Authenticated users can create lists" ON lists;
DROP POLICY IF EXISTS "Owners can update lists" ON lists;
DROP POLICY IF EXISTS "Owners can delete lists" ON lists;

CREATE POLICY "Members can view their lists"
  ON lists FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = lists.id
        AND list_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create lists"
  ON lists FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Owners can update lists"
  ON lists FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = lists.id
        AND list_members.user_id = (select auth.uid())
        AND list_members.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = lists.id
        AND list_members.user_id = (select auth.uid())
        AND list_members.role = 'owner'
    )
  );

CREATE POLICY "Owners can delete lists"
  ON lists FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = lists.id
        AND list_members.user_id = (select auth.uid())
        AND list_members.role = 'owner'
    )
  );

-- ============================================================
-- items
-- ============================================================

DROP POLICY IF EXISTS "List members can view items" ON items;
DROP POLICY IF EXISTS "List members can add items" ON items;
DROP POLICY IF EXISTS "List members can update items" ON items;
DROP POLICY IF EXISTS "List members can delete items" ON items;

CREATE POLICY "List members can view items"
  ON items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = items.list_id
        AND list_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "List members can add items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = items.list_id
        AND list_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "List members can update items"
  ON items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = items.list_id
        AND list_members.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = items.list_id
        AND list_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "List members can delete items"
  ON items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = items.list_id
        AND list_members.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- share_invites
-- ============================================================

DROP POLICY IF EXISTS "List owners can create invites" ON share_invites;
DROP POLICY IF EXISTS "Users can redeem invites" ON share_invites;
DROP POLICY IF EXISTS "Authenticated users can read invites" ON share_invites;

CREATE POLICY "Authenticated users can read invites"
  ON share_invites FOR SELECT
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR used_by = (select auth.uid())
    OR (used_by IS NULL AND expires_at > now())
  );

CREATE POLICY "List owners can create invites"
  ON share_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = share_invites.list_id
        AND list_members.user_id = (select auth.uid())
        AND list_members.role = 'owner'
    )
  );

CREATE POLICY "Users can redeem invites"
  ON share_invites FOR UPDATE
  TO authenticated
  USING (
    used_by IS NULL
    AND expires_at > now()
  )
  WITH CHECK (used_by = (select auth.uid()));

-- ============================================================
-- Add missing indexes on share_invites foreign keys
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_share_invites_created_by ON share_invites(created_by);
CREATE INDEX IF NOT EXISTS idx_share_invites_used_by ON share_invites(used_by);

-- ============================================================
-- Drop unused indexes
-- ============================================================

DROP INDEX IF EXISTS idx_lists_created_by;
DROP INDEX IF EXISTS idx_items_added_by;
DROP INDEX IF EXISTS idx_templates_created_by;
DROP INDEX IF EXISTS idx_template_items_template_id;
DROP INDEX IF EXISTS idx_user_presence_list_id;
DROP INDEX IF EXISTS idx_share_invites_code;
DROP INDEX IF EXISTS idx_list_members_user_id;
DROP INDEX IF EXISTS idx_list_members_list_id;
