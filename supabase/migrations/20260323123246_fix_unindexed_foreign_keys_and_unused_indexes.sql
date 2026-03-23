/*
  # Fix Unindexed Foreign Keys and Unused Indexes

  ## Summary
  This migration addresses performance and security warnings from Supabase's database advisor.

  ## Changes

  ### 1. New Indexes (Foreign Key Coverage)
  Adding covering indexes for all foreign keys that lack them:

  - `items.added_by` → `auth.users.id` (items_added_by_fkey)
  - `list_members.user_id` → `auth.users.id` (list_members_user_id_fkey)
  - `lists.created_by` → `auth.users.id` (lists_created_by_fkey)
  - `template_items.template_id` → `templates.id` (template_items_template_id_fkey)
  - `templates.created_by` → `auth.users.id` (templates_created_by_fkey)
  - `user_presence.list_id` → `lists.id` (user_presence_list_id_fkey)

  ### 2. Dropped Indexes (Unused)
  Removing indexes that have never been used and consume unnecessary resources:

  - `idx_share_invites_created_by` on `share_invites`
  - `idx_share_invites_used_by` on `share_invites`

  ## Notes
  - All index creations use IF NOT EXISTS to be safe
  - Dropping unused indexes reduces write overhead and storage
*/

CREATE INDEX IF NOT EXISTS idx_items_added_by
  ON public.items (added_by);

CREATE INDEX IF NOT EXISTS idx_list_members_user_id
  ON public.list_members (user_id);

CREATE INDEX IF NOT EXISTS idx_lists_created_by
  ON public.lists (created_by);

CREATE INDEX IF NOT EXISTS idx_template_items_template_id
  ON public.template_items (template_id);

CREATE INDEX IF NOT EXISTS idx_templates_created_by
  ON public.templates (created_by);

CREATE INDEX IF NOT EXISTS idx_user_presence_list_id
  ON public.user_presence (list_id);

DROP INDEX IF EXISTS public.idx_share_invites_created_by;
DROP INDEX IF EXISTS public.idx_share_invites_used_by;
