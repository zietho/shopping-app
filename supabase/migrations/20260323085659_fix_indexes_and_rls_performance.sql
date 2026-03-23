/*
  # Fix Unindexed Foreign Keys and RLS Performance

  1. Indexes
    - Add covering indexes for all foreign key columns missing them:
      - items.added_by
      - items.list_id
      - lists.created_by
      - template_items.template_id
      - templates.created_by
      - user_presence.list_id

  2. RLS Policy Performance
    - Drop and recreate all RLS policies using (select auth.uid()) pattern
    - Affects tables: profiles, lists, items, templates, template_items, user_presence
    - This prevents re-evaluation of auth functions per row, improving query performance at scale
*/

-- Indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_items_added_by ON public.items(added_by);
CREATE INDEX IF NOT EXISTS idx_items_list_id ON public.items(list_id);
CREATE INDEX IF NOT EXISTS idx_lists_created_by ON public.lists(created_by);
CREATE INDEX IF NOT EXISTS idx_template_items_template_id ON public.template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON public.templates(created_by);
CREATE INDEX IF NOT EXISTS idx_user_presence_list_id ON public.user_presence(list_id);

-- profiles: drop and recreate policies
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- lists: drop and recreate policies
DROP POLICY IF EXISTS "Authenticated users can read lists" ON public.lists;
DROP POLICY IF EXISTS "Authenticated users can create lists" ON public.lists;
DROP POLICY IF EXISTS "Authenticated users can update lists" ON public.lists;
DROP POLICY IF EXISTS "Authenticated users can delete lists" ON public.lists;

CREATE POLICY "Authenticated users can read lists"
  ON public.lists FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can create lists"
  ON public.lists FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can update lists"
  ON public.lists FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can delete lists"
  ON public.lists FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- items: drop and recreate policies
DROP POLICY IF EXISTS "Authenticated users can read items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can create items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can update items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can delete items" ON public.items;

CREATE POLICY "Authenticated users can read items"
  ON public.items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can create items"
  ON public.items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can update items"
  ON public.items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can delete items"
  ON public.items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- templates: drop and recreate policies
DROP POLICY IF EXISTS "Authenticated users can read templates" ON public.templates;
DROP POLICY IF EXISTS "Authenticated users can create templates" ON public.templates;
DROP POLICY IF EXISTS "Authenticated users can update templates" ON public.templates;
DROP POLICY IF EXISTS "Authenticated users can delete templates" ON public.templates;

CREATE POLICY "Authenticated users can read templates"
  ON public.templates FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can create templates"
  ON public.templates FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can update templates"
  ON public.templates FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can delete templates"
  ON public.templates FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- template_items: drop and recreate policies
DROP POLICY IF EXISTS "Authenticated users can read template items" ON public.template_items;
DROP POLICY IF EXISTS "Authenticated users can create template items" ON public.template_items;
DROP POLICY IF EXISTS "Authenticated users can update template items" ON public.template_items;
DROP POLICY IF EXISTS "Authenticated users can delete template items" ON public.template_items;

CREATE POLICY "Authenticated users can read template items"
  ON public.template_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can create template items"
  ON public.template_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can update template items"
  ON public.template_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can delete template items"
  ON public.template_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- user_presence: drop and recreate policies
DROP POLICY IF EXISTS "Authenticated users can read presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can upsert own presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can update own presence" ON public.user_presence;

CREATE POLICY "Authenticated users can read presence"
  ON public.user_presence FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users can upsert own presence"
  ON public.user_presence FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own presence"
  ON public.user_presence FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
