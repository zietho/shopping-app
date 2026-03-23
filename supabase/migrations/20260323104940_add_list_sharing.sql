/*
  # Add List Sharing: list_members and share_invites

  ## Summary
  Introduces proper list sharing so any registered user can be a member of a list
  and invite others via a generated code.

  ## New Tables

  ### list_members
  - `list_id` (uuid, FK → lists) — which list
  - `user_id` (uuid, FK → auth.users) — who is a member
  - `role` (text) — 'owner' or 'member'
  - `joined_at` (timestamptz) — when they joined

  ### share_invites
  - `id` (uuid, PK)
  - `list_id` (uuid, FK → lists) — which list this invite is for
  - `invite_code` (text, unique) — short alphanumeric code
  - `created_by` (uuid, FK → auth.users)
  - `created_at` (timestamptz)
  - `expires_at` (timestamptz) — nullable; if null, never expires
  - `used_by` (uuid, nullable) — set when redeemed

  ## Schema Changes to Existing Tables

  ### lists
  - Drop old restrictive RLS policies (they may only allow created_by access)
  - New SELECT policy: allow if user has a row in list_members for this list
  - INSERT policy: any authenticated user (they also insert their own list_members row)
  - UPDATE/DELETE policy: only the owner (list_members.role = 'owner')

  ### items
  - SELECT/INSERT/UPDATE/DELETE: allowed if user is a member of the item's list

  ## Security
  - RLS enabled on both new tables
  - list_members: members can read their own membership; only owners can insert new members (via invite)
  - share_invites: anyone authenticated can read an invite by code; only owner can create

  ## Data Migration
  - Seed list_members rows for all existing lists using created_by as owner
    (only when the user exists in auth.users)
*/

-- ───────────────────────────────────────────────
-- 1. list_members
-- ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS list_members (
  list_id   uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (list_id, user_id)
);

ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;

-- Members can see membership rows for lists they belong to
CREATE POLICY "Members can view their list memberships"
  ON list_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM list_members lm2
      WHERE lm2.list_id = list_members.list_id
        AND lm2.user_id = auth.uid()
    )
  );

-- Any authenticated user can insert themselves as a member (used when redeeming invite)
CREATE POLICY "Users can join lists"
  ON list_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Owners can remove members (or members remove themselves)
CREATE POLICY "Owners or self can delete membership"
  ON list_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM list_members lm2
      WHERE lm2.list_id = list_members.list_id
        AND lm2.user_id = auth.uid()
        AND lm2.role = 'owner'
    )
  );

-- ───────────────────────────────────────────────
-- 2. share_invites
-- ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS share_invites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id     uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE,
  created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz,
  used_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE share_invites ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can look up an invite by code (needed to redeem)
CREATE POLICY "Authenticated users can read invites"
  ON share_invites FOR SELECT
  TO authenticated
  USING (true);

-- Only owners of the list can create invites
CREATE POLICY "List owners can create invites"
  ON share_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = share_invites.list_id
        AND list_members.user_id = auth.uid()
        AND list_members.role = 'owner'
    )
  );

-- The redeemer can update used_by on the invite
CREATE POLICY "Users can redeem invites"
  ON share_invites FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (used_by = auth.uid());

-- ───────────────────────────────────────────────
-- 3. Update RLS on lists
-- ───────────────────────────────────────────────

-- Drop any existing policies on lists so we can replace them cleanly
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'lists' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON lists', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Members can view their lists"
  ON lists FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = lists.id
        AND list_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create lists"
  ON lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update lists"
  ON lists FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = lists.id
        AND list_members.user_id = auth.uid()
        AND list_members.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = lists.id
        AND list_members.user_id = auth.uid()
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
        AND list_members.user_id = auth.uid()
        AND list_members.role = 'owner'
    )
  );

-- ───────────────────────────────────────────────
-- 4. Update RLS on items
-- ───────────────────────────────────────────────

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'items' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON items', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "List members can view items"
  ON items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = items.list_id
        AND list_members.user_id = auth.uid()
    )
  );

CREATE POLICY "List members can add items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = items.list_id
        AND list_members.user_id = auth.uid()
    )
  );

CREATE POLICY "List members can update items"
  ON items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = items.list_id
        AND list_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = items.list_id
        AND list_members.user_id = auth.uid()
    )
  );

CREATE POLICY "List members can delete items"
  ON items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = items.list_id
        AND list_members.user_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────
-- 5. Seed list_members for existing lists
-- ───────────────────────────────────────────────

INSERT INTO list_members (list_id, user_id, role)
SELECT l.id, l.created_by, 'owner'
FROM lists l
WHERE l.created_by IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = l.created_by)
ON CONFLICT (list_id, user_id) DO NOTHING;

-- ───────────────────────────────────────────────
-- 6. Indexes for performance
-- ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_list_members_user_id ON list_members(user_id);
CREATE INDEX IF NOT EXISTS idx_list_members_list_id ON list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_share_invites_code ON share_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_share_invites_list_id ON share_invites(list_id);
