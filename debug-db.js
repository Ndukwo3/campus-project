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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectDb() {
    console.log("Checking database...");

    // Get table info or sample data
    const { data: participants, error: pErr } = await supabase.from('conversation_participants').select('*');
    if (pErr) console.error("Participant fetch error:", pErr);
    else console.log(`Found ${participants?.length || 0} participants.`);

    const { data: convos, error: cErr } = await supabase.from('conversations').select('*');
    if (cErr) console.error("Conversations fetch error:", cErr);
    else console.log(`Found ${convos?.length || 0} conversations.`);

    const { data: msgs, error: mErr } = await supabase.from('messages').select('*');
    if (mErr) console.error("Messages fetch error:", mErr);
    else {
        console.log(`Found ${msgs?.length || 0} messages.`);
        if (msgs && msgs.length > 0) {
            console.log("Sample message:", msgs[0]);
        }
    }

    // Try to get policies if possible (RPC only, we can't query pg_policies without it)
    // We can just rely on the data length. If msgs > 0, they exist.
}

inspectDb();
