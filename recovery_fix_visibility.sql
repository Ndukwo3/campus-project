-- 🚨 EMERGENCY RECOVERY: Restore Message Visibility
-- This script fixes the 'disappearing messages' by removing the recursive policies.

-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can see participants" ON conversation_participants;

-- 2. Restore basic non-recursive visibility (Safe & Secure)
-- Users can see conversations they are part of
CREATE POLICY "Users can view their conversations" ON conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversations.id 
    AND user_id = auth.uid()
  )
);

-- Users can see their own participant records
CREATE POLICY "Users can view their participant records" ON conversation_participants
FOR SELECT USING (user_id = auth.uid());

-- Users can see messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id 
    AND user_id = auth.uid()
  )
);

-- 3. Confirm RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
