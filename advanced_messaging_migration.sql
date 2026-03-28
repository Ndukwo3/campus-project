-- Add columns for editing and view-once features
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_view_once BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS has_been_viewed BOOLEAN DEFAULT false;

-- Add a column to track who has deleted the message for themselves
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by UUID[] DEFAULT '{}';
