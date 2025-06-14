
-- Remove the foreign key constraint that's causing the error
-- Since this is a username-based app, we don't need the profiles table to reference auth.users

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Also make sure the id column is properly set up as a UUID with default value
-- since we're not using auth.users anymore
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
