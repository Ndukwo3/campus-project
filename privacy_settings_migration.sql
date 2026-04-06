-- Add privacy settings columns to public.profiles
-- Run this in your Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS post_visibility VARCHAR(50) DEFAULT 'My Univas Only',
ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(50) DEFAULT 'Univas Only',
ADD COLUMN IF NOT EXISTS follower_visibility VARCHAR(50) DEFAULT 'Everyone',
ADD COLUMN IF NOT EXISTS can_message VARCHAR(50) DEFAULT 'Everyone',
ADD COLUMN IF NOT EXISTS can_tag VARCHAR(50) DEFAULT 'Everyone';

-- Add a comment for clarity
COMMENT ON COLUMN public.profiles.post_visibility IS 'Privacy setting for post visibility';
COMMENT ON COLUMN public.profiles.profile_visibility IS 'Privacy setting for profile visibility';
COMMENT ON COLUMN public.profiles.follower_visibility IS 'Privacy setting for follower list visibility';
COMMENT ON COLUMN public.profiles.can_message IS 'Privacy setting for direct messaging';
COMMENT ON COLUMN public.profiles.can_tag IS 'Privacy setting for tagging in posts';
