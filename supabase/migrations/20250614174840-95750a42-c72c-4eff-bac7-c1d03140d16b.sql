
-- Drop existing RLS policies if any and create new ones that allow unauthenticated access
-- This is needed because the app uses username-based access, not authentication

-- First, let's see if there are any existing policies and remove them
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;

-- Create new policies that allow public access for this username-based app
CREATE POLICY "Allow public read on profiles" 
  ON profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert on profiles" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update on profiles" 
  ON profiles 
  FOR UPDATE 
  USING (true);

-- Also update the notes table policies to allow public access
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

CREATE POLICY "Allow public read on notes" 
  ON notes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert on notes" 
  ON notes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update on notes" 
  ON notes 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete on notes" 
  ON notes 
  FOR DELETE 
  USING (true);
