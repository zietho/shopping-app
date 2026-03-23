/*
  # Shopping App Schema

  ## Overview
  Creates all tables for the two-person collaborative shopping app.

  ## New Tables
  1. `profiles` - User display info (username, avatar color), linked to auth.users
  2. `lists` - Shopping lists
  3. `items` - Items within a list
  4. `templates` - Saved item list templates
  5. `template_items` - Items within a template
  6. `user_presence` - Tracks which list each user is currently viewing

  ## Security
  - RLS enabled on all tables
  - All authenticated users can read/write all data (shared 2-person app design)
  - Requires authentication for all access

  ## Notes
  - This is a prototype with two demo users; all data is shared between them
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_color text DEFAULT '#00C2B2',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Lists table
CREATE TABLE IF NOT EXISTS lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read lists"
  ON lists FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create lists"
  ON lists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update lists"
  ON lists FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete lists"
  ON lists FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity text DEFAULT '',
  checked boolean DEFAULT false,
  position integer DEFAULT 0,
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read items"
  ON items FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create items"
  ON items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update items"
  ON items FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete items"
  ON items FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read templates"
  ON templates FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create templates"
  ON templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update templates"
  ON templates FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete templates"
  ON templates FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Template items table
CREATE TABLE IF NOT EXISTS template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity text DEFAULT '',
  position integer DEFAULT 0
);

ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read template items"
  ON template_items FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create template items"
  ON template_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update template items"
  ON template_items FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete template items"
  ON template_items FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- User presence table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id uuid REFERENCES lists(id) ON DELETE SET NULL,
  last_seen timestamptz DEFAULT now()
);

ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read presence"
  ON user_presence FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can upsert own presence"
  ON user_presence FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence"
  ON user_presence FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for items and user_presence
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE lists;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
