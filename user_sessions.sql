-- 1. Create user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id text UNIQUE NOT NULL, -- Logical session identifier
    device_name text NOT NULL,        -- MacBook Pro, iPhone, etc.
    browser_name text,                -- Chrome, Safari, etc.
    city text,                        -- Actual city via Geolocation
    country text DEFAULT 'Nigeria',
    last_active timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Enable Realtime
ALTER TABLE public.user_sessions REPLICA IDENTITY FULL;
COMMENT ON TABLE public.user_sessions IS 'Tracks active login sessions for multi-device monitoring';

-- 3. Security (RLS)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can only delete their own sessions (Remote logout)
DROP POLICY IF EXISTS "Users can logout own sessions" ON public.user_sessions;
CREATE POLICY "Users can logout own sessions" ON public.user_sessions FOR DELETE 
    USING (auth.uid() = user_id);

-- System can insert/update (Authenticated users via hook)
DROP POLICY IF EXISTS "Users can manage own session identity" ON public.user_sessions;
CREATE POLICY "Users can manage own session identity" ON public.user_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session pulse" ON public.user_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Automatically add to Realtime publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.user_sessions;
COMMIT;
