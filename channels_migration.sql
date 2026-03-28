-- MIGRATION: Communities & Channels Architecture
-- Transforms flat groups into hubs with multiple channels

-- 0. Ensure 'is_private' column exists on groups (Fixes missing column error)
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- 0.1 Ensure 'role' column exists on group_members and bootstrap admins
ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'member';

UPDATE public.group_members gm 
SET role = 'admin' 
FROM public.groups g 
WHERE gm.group_id = g.id AND gm.user_id = g.created_by AND gm.role != 'admin';

-- 0.2 Create group_messages table if it hasn't been created yet from the schema!
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);



-- 1. Create Channels Table
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure channels within the same group have unique names
    UNIQUE(group_id, name)
);

-- 2. Enable RLS on Channels
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- 3. Channel Policies
CREATE POLICY "Anyone who can see the group can see its channels"
    ON public.channels FOR SELECT
    USING (
        group_id IN (
            SELECT id FROM public.groups WHERE is_private = false
        ) OR
        group_id IN (
            SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can create channels"
    ON public.channels FOR INSERT
    WITH CHECK (
        group_id IN (
            SELECT group_id FROM public.group_members WHERE user_id = auth.uid() AND role = 'admin'
        ) 
        -- Also allow group creator to create channels implicitly via triggers if needed
    );

-- 4. Update messages table to belong to channels instead of directly to groups
-- We add the column allowing NULL temporarily for migration
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE;

-- 5. Data Migration: Create a default '#general' channel for existing groups
DO $$
DECLARE
    g_id UUID;
    c_id UUID;
    v_group RECORD;
BEGIN
    FOR v_group IN SELECT id FROM public.groups LOOP
        -- Insert a general channel for the group
        INSERT INTO public.channels (group_id, name, description)
        VALUES (v_group.id, 'general', 'General discussion')
        ON CONFLICT (group_id, name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO c_id;

        -- Map all existing messages for this group to the newly created 'general' channel
        UPDATE public.group_messages 
        SET channel_id = c_id 
        WHERE group_id = v_group.id AND channel_id IS NULL;
    END LOOP;
END $$;

-- 6. Enforce NOT NULL on channel_id now that data is migrated
-- Since this is an existing database, we will leave group_id alone (for backward compatibility safety),
-- but we make channel_id required for all new messages.
ALTER TABLE public.group_messages ALTER COLUMN channel_id SET NOT NULL;

-- 7. Update Policies for Group Messages
-- Drop old policies (if named exactly like this in groups_schema.sql)
DROP POLICY IF EXISTS "Members can view group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Members can insert group messages" ON public.group_messages;

-- Create new policies based on channel access
CREATE POLICY "Members can view channel messages"
    ON public.group_messages FOR SELECT
    USING (
        channel_id IN (
            SELECT c.id FROM public.channels c
            JOIN public.group_members gm ON c.group_id = gm.group_id
            WHERE gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can insert channel messages"
    ON public.group_messages FOR INSERT
    WITH CHECK (
        channel_id IN (
            SELECT c.id FROM public.channels c
            JOIN public.group_members gm ON c.group_id = gm.group_id
            WHERE gm.user_id = auth.uid()
        ) AND
        sender_id = auth.uid()
    );

-- 8. Trigger to automatically create a #general channel on group creation
CREATE OR REPLACE FUNCTION public.create_default_group_channel()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.channels (group_id, name, description)
    VALUES (NEW.id, 'general', 'General discussion');
    
    INSERT INTO public.channels (group_id, name, description)
    VALUES (NEW.id, 'announcements', 'Community announcements and news');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_group_created ON public.groups;

CREATE TRIGGER on_group_created
    AFTER INSERT ON public.groups
    FOR EACH ROW EXECUTE FUNCTION public.create_default_group_channel();
