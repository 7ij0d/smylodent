-- SQL Database Patch for SMYLODENT
-- Copy and run this in your Supabase project's SQL Editor

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

-- 2. Grant table-level read/write permissions to Supabase API roles
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
