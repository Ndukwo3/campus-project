-- 🛡️ Univas Shield: Messaging Recursion Fix
-- This script eliminates infinite loops in Row Level Security (RLS) policies
-- by using a security-definer function for membership checks.

-- 1. Create a security-definer function to break recursion
-- This function runs with the permissions of the owner (superuser context)
-- and therefore does not trigger RLS when it queries conversation_participants.
CREATE OR REPLACE FUNCTION public.is_conversation_participant(convo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = convo_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;

-- 3. Apply non-recursive policies for conversation_participants
-- A user can see a participant record if they are part of that same conversation.
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
FOR SELECT USING (is_conversation_participant(conversation_id));

CREATE POLICY "Users can insert participants" ON conversation_participants
FOR INSERT WITH CHECK (true);

-- 4. Apply non-recursive policies for conversations
CREATE POLICY "Users can view their conversations" ON conversations
FOR SELECT USING (is_conversation_participant(id));

-- 5. Apply non-recursive policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (is_conversation_participant(conversation_id));

CREATE POLICY "Users can insert messages" ON messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  is_conversation_participant(conversation_id)
);

CREATE POLICY "Users can update messages" ON messages
FOR UPDATE USING (is_conversation_participant(conversation_id));

-- 6. Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID) TO anon;

-- Verification query (run this in Supabase to check if your user sees data)
-- SELECT * FROM conversation_participants LIMIT 10;
