
-- Add missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_entries INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Also add a default email column since it's required by the schema
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
