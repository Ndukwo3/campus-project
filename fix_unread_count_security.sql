-- 🛡️ Univas Shield: Unread Count Security Cleanup
-- This migration ensures that users only see and count messages intended for them.

-- 1. Remove any known "Lazy" or permissive policies that bypass security
DROP POLICY IF EXISTS "Enable everything" ON conversations;
DROP POLICY IF EXISTS "Enable everything" ON messages;
DROP POLICY IF EXISTS "Enable everything" ON conversation_participants;
DROP POLICY IF EXISTS "Allow All" ON messages;
DROP POLICY IF EXISTS "Public Access" ON messages;

-- 2. Force Enable RLS (just in case it was disabled)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. Reinforce Participant-Based Select for Messages
-- This ensures the 'count' function only sees messages in a user's own conversations.
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (
  conversation_id IN (
    SELECT cp.conversation_id 
    FROM conversation_participants cp 
    WHERE cp.user_id = auth.uid()
  )
);

-- 4. Reinforce Participant-Based Select for Conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
FOR SELECT USING (
  id IN (
    SELECT cp.conversation_id 
    FROM conversation_participants cp 
    WHERE cp.user_id = auth.uid()
  )
);

-- 5. Reinforce Participant-Based Select for conversation_participants
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
FOR SELECT USING (
  conversation_id IN (
    SELECT cp2.conversation_id 
    FROM conversation_participants cp2 
    WHERE cp2.user_id = auth.uid()
  )
);
