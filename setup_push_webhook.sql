-- 1. Create a function to handle sending push notifications
-- This function will be called by the trigger whenever a new notification is inserted.
create or replace function public.handle_new_notification_push()
returns trigger as $$
declare
  payload jsonb;
begin
  -- Construct the payload to send to your Next.js API
  -- IMPORTANT: Replace 'https://uni-city.vercel.app' with your actual production URL if different
  payload := jsonb_build_object(
    'table', 'notifications',
    'record', row_to_json(new)
  );

  -- Call the external API
  perform
    net.http_post(
      url := 'https://uni-city.vercel.app/api/push/send',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := payload
    );

  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger on the notifications table
drop trigger if exists on_notification_inserted_push on public.notifications;
create trigger on_notification_inserted_push
  after insert on public.notifications
  for each row execute function public.handle_new_notification_push();

-- 3. Enable the net extension if not already enabled (required for http_post)
create extension if not exists "pg_net" with schema "extensions";

-- NOTE: If net.http_post fails, ensure that 'extensions' is in your search_path
-- or use extensions.net.http_post directly.
