-- Add audio_url column to public.products if it doesn't already exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL;
