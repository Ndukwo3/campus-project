const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    env[key.trim()] = values.join('=').trim().replace(/"/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    // Attempt the query that a logged-in user would do.
    // Wait, without auth.uid, RLS will block it. So we might just get [] instead of infinite recursion if auth.uid() is null.
    // But let's log in! We need a user.
    // If we can't log in, maybe we can just query with an anon key and see if the infinite recursion hits anyway?
    const { data, error } = await supabase.from('conversation_participants').select('*');
    console.log("Error:", error);
}

test();
