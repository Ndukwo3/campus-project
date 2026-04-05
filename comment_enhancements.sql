-- 1. Add parent_id to support nested replies
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;

-- 2. Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(comment_id, user_id)
);

-- 3. Enable RLS on comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for comment_likes
DROP POLICY IF EXISTS "Enable read for all" ON public.comment_likes;
CREATE POLICY "Enable read for all" ON public.comment_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.comment_likes;
CREATE POLICY "Enable insert for authenticated" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for owner" ON public.comment_likes;
CREATE POLICY "Enable delete for owner" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- 5. Add likes_count/replies_count if you want (optional, we can just count)
-- ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;
