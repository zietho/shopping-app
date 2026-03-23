/*
  # Seed Demo Users and Initial Data

  ## Overview
  Creates two demo users for prototype testing and seeds initial data.

  ## Demo Users (PROTOTYPE ONLY - replace before production)
  - sara / saralovesshoppingtogether!  -> sara@demo.local
  - thomas / thomaslovesshoppingtogether! -> thomas@demo.local

  ## Seeded Data
  - Profiles for both users
  - One shared "Weekly Groceries" list with sample items
  - Two starter templates: "Weekly Groceries" and "BBQ Party"

  ## Developer Notes
  - These credentials are DEMO ONLY. Store hashed passwords in production.
  - Configured in auth.users and auth.identities tables.
  - User IDs are fixed UUIDs for referencing in seeds.
*/

DO $$
BEGIN
  -- Sara
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sara@demo.local') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'authenticated', 'authenticated', 'sara@demo.local',
      crypt('saralovesshoppingtogether!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"sara"}',
      NOW(), NOW(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'sara@demo.local',
      '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","email":"sara@demo.local","email_verified":true}',
      'email', NOW(), NOW(), NOW()
    );
  END IF;

  -- Thomas
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'thomas@demo.local') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'authenticated', 'authenticated', 'thomas@demo.local',
      crypt('thomaslovesshoppingtogether!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"thomas"}',
      NOW(), NOW(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'thomas@demo.local',
      '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","email":"thomas@demo.local","email_verified":true}',
      'email', NOW(), NOW(), NOW()
    );
  END IF;
END $$;

-- Insert profiles
INSERT INTO profiles (id, username, avatar_color)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sara', '#00C2B2'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'thomas', '#4C51BF')
ON CONFLICT (id) DO NOTHING;

-- Insert a shared list
INSERT INTO lists (id, name, created_by)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Weekly Groceries', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (id) DO NOTHING;

-- Insert sample items into the list
INSERT INTO items (list_id, name, quantity, checked, position)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Milk', '1 carton', false, 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bread', '1 loaf', false, 2),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Eggs', '12 pack', false, 3),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Butter', '250g', false, 4),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Apples', '6 pack', false, 5)
ON CONFLICT DO NOTHING;

-- Insert starter templates
INSERT INTO templates (id, name, created_by, is_favorite)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Weekly Groceries', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'BBQ Party', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_items (template_id, name, quantity, position)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Milk', '1 carton', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Bread', '1 loaf', 2),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Eggs', '12 pack', 3),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Butter', '250g', 4),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Cheese', '200g', 5),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Yogurt', '500ml', 6),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Apples', '6 pack', 7),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Bananas', '1 bunch', 8),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Chicken', '2kg', 1),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Burgers', '8 pack', 2),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Buns', '8 pack', 3),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Corn', '6 ears', 4),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'BBQ Sauce', '1 bottle', 5),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Coleslaw', '500g', 6),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Beer', '24 pack', 7)
ON CONFLICT DO NOTHING;
