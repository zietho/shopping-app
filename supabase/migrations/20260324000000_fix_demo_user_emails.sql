-- Fix demo user emails to match app's username@shoplist.app pattern
UPDATE auth.users SET email = 'sara@shoplist.app' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE auth.users SET email = 'thomas@shoplist.app' WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

UPDATE auth.identities SET
  provider_id = 'sara@shoplist.app',
  identity_data = '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","email":"sara@shoplist.app","email_verified":true}'
WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE auth.identities SET
  provider_id = 'thomas@shoplist.app',
  identity_data = '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","email":"thomas@shoplist.app","email_verified":true}'
WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
