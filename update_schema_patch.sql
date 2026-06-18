-- SQL Database Patch for SMYLODENT
-- Copy and run this in your Supabase project's SQL Editor (under SQL Editor -> New Query)

-- 1. Add image_url column to the years table if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'years' 
          AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.years ADD COLUMN image_url text;
    END IF;
END $$;

-- 2. Disable Row-Level Security (RLS) on all tables to avoid permission errors
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.years DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages_content DISABLE ROW LEVEL SECURITY;

-- 3. Grant full permissions to Supabase API roles (anon and authenticated)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Create the admin user in auth.users (if not already existing) with password 'admin123'
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1a1a1a1-1234-5678-9999-999999999999',
  'authenticated',
  'authenticated',
  'admin@smylodent.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  null,
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"أدمن سمايلودنت","role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 5. Create the corresponding profile for the admin user
INSERT INTO public.profiles (id, full_name, phone, role)
VALUES (
  'a1a1a1a1-1234-5678-9999-999999999999',
  'أدمن سمايلودنت',
  '0912345678',
  'admin'
) ON CONFLICT (id) DO NOTHING;
