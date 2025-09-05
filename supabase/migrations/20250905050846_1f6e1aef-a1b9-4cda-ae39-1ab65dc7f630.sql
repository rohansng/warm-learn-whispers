-- Fix function search path security warnings
-- Update the handle_new_user function to have proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  );
  RETURN new;
END;
$function$;

-- Update the ensure_chat_room_order function to have proper search_path  
CREATE OR REPLACE FUNCTION public.ensure_chat_room_order()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.participant_1 > NEW.participant_2 THEN
    -- Swap participants to maintain consistent ordering
    NEW.participant_1 := OLD.participant_2;
    NEW.participant_2 := OLD.participant_1;
  END IF;
  RETURN NEW;
END;
$function$;