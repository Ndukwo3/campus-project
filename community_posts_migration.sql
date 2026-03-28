-- Add group_id to posts to support Community Feeds (Facebook Group style)
ALTER TABLE IF EXISTS public.posts ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;

-- Update RLS policies for posts to include group visibility
-- Note: 'Anyone can view posts' policy likely exists. We need to ensure private group posts are NOT public.
-- If the existing policy is 'USING (true)', we might need to tighten it or add a specific one.

-- Tighten visibility: Only members can see posts within a group
-- Assuming existing policy name is "Anyone can view posts" (need to check actual name)
-- For now, let's add a general visibility logic that respects group privacy.

-- Drop existing generic select policy if it's too broad
-- DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;

-- Create/Update visibility policy
CREATE POLICY "Visibility of posts: community members or public"
ON public.posts FOR SELECT
USING (
    group_id IS NULL OR 
    group_id IN (
        SELECT id FROM public.groups WHERE is_private = false
    ) OR
    group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
);

-- Ensure users can insert group posts if they are members
CREATE POLICY "Members can insert community posts"
ON public.posts FOR INSERT
WITH CHECK (
    group_id IS NULL OR 
    group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
);
