-- Create reposts table
CREATE TABLE IF NOT EXISTS public.reposts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

-- Enable RLS for reposts
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reposts"
    ON public.reposts FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert their own reposts"
    ON public.reposts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reposts"
    ON public.reposts FOR DELETE
    USING (auth.uid() = user_id);
