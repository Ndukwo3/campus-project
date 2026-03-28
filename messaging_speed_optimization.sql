-- Speed up message searches by adding an index on conversation_id
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Speed up looking for latest messages by indexing created_at
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Speed up participant checks
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
