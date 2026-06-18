-- SQL Migration: Interactive Map & User Management Fields
-- Run this in your Supabase SQL Editor to support map geolocations and account disable actions.

-- 1. Add columns to public.profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_text text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'disabled'));

-- 2. Add columns to public.orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address_text text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS longitude numeric;

-- 3. Re-grant privileges on these modifications to ensure API roles can read/write them
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Update trigger function to save user email automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, phone_secondary, university, college, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'طالب جديد'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    new.raw_user_meta_data->>'phone_secondary',
    COALESCE(new.raw_user_meta_data->>'university', 'جامعة طرابلس'),
    COALESCE(new.raw_user_meta_data->>'college', 'كلية طب الأسنان'),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  ) ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
