
-- Add moderated_university_id to profiles to support campus-specific moderation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS moderated_university_id UUID REFERENCES universities(id);

-- Add a comment for clarity
COMMENT ON COLUMN profiles.moderated_university_id IS 'The university this user is authorized to moderate (only for moderator role).';

-- Update RLS for profiles if necessary (already exists likely, but we need to ensure mods can see it)
-- Usually profiles are readable by the owner or admins.
