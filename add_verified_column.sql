ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
COMMENT ON COLUMN public.profiles.is_verified IS 'Whether the user has a completed profile or is manually verified.';

-- Function to automatically update is_verified status
CREATE OR REPLACE FUNCTION public.update_profile_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Only auto-verify if they meet the criteria. 
    IF (NEW.full_name IS NOT NULL AND NEW.full_name != '' AND
        NEW.username IS NOT NULL AND NEW.username != '' AND
        NEW.avatar_url IS NOT NULL AND NEW.avatar_url != '' AND
        NEW.university_id IS NOT NULL) THEN
        NEW.is_verified := true;
    ELSE
        -- If they don't meet criteria, only set to false if they aren't an admin/staff
        IF (NEW.role != 'admin' AND NEW.role != 'super_admin') THEN
            NEW.is_verified := false;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run before every insert or update on profiles
DROP TRIGGER IF EXISTS tr_update_profile_verification ON public.profiles;
CREATE TRIGGER tr_update_profile_verification
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_verification_status();

-- Initial sync for existing users
UPDATE public.profiles 
SET is_verified = true 
WHERE full_name IS NOT NULL AND full_name != ''
AND username IS NOT NULL AND username != ''
AND avatar_url IS NOT NULL AND avatar_url != ''
AND university_id IS NOT NULL;
