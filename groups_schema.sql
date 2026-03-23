-- Groups Table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Group Members Table
CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

-- Group Messages Table (Separate from 1-to-1 messages for clarity)
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Groups
CREATE POLICY "Anyone in the same university can see public groups"
    ON public.groups FOR SELECT
    USING (
        is_private = false OR 
        id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Authenticated users can create groups"
    ON public.groups FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Policies for Group Members
CREATE POLICY "Group members can see other members"
    ON public.group_members FOR SELECT
    USING (
        group_id IN (SELECT id FROM public.groups WHERE is_private = false) OR
        group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can join public groups"
    ON public.group_members FOR INSERT
    WITH CHECK (
        group_id IN (SELECT id FROM public.groups WHERE is_private = false)
    );

-- Policies for Group Messages
CREATE POLICY "Members can view group messages"
    ON public.group_messages FOR SELECT
    USING (
        group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Members can insert group messages"
    ON public.group_messages FOR INSERT
    WITH CHECK (
        group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()) AND
        sender_id = auth.uid()
    );
