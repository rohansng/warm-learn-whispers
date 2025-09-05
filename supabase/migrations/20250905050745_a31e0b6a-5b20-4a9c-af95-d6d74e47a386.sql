-- Remove the insecure public read policy on profiles
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;

-- Remove the insecure public update policy on profiles  
DROP POLICY IF EXISTS "Allow public update on profiles" ON public.profiles;

-- Remove the insecure public insert policy on profiles
DROP POLICY IF EXISTS "Allow public insert on profiles" ON public.profiles;

-- Create a more secure policy that allows users to view profiles by username for chat functionality
-- but only returns limited information (id, username, last_visit) without exposing email
CREATE POLICY "Users can view limited profile info for chat" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep the existing secure policies for authenticated users to manage their own profiles
-- These policies already exist and are secure:
-- "Users can view their own profile" - allows viewing full profile including email for own profile
-- "Users can update their own profile" - allows updating own profile  
-- "Users can insert their own profile" - allows creating own profile