-- Enable Realtime for the 'comments' table
-- This allows Supabase to broadcast changes (INSERT, UPDATE, DELETE) to the client in real-time.

-- 1. Add the table to the 'supabase_realtime' publication
-- If the publication doesn't exist yet, we create it.
-- If it does exist, we just add the table to it.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- 2. Ensure the table has 'FULL' replica identity to support broadcasting all columns during updates/deletes
ALTER TABLE public.comments REPLICA IDENTITY FULL;
