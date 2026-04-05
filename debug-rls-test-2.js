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
const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testRLS() {
    console.log("Testing RLS...");
    
    // Create a temporary user to test RLS
    const testEmail = `test2_${Date.now()}@test.com`;
    const testPassword = 'password123';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
    });
    
    if (authError) {
        console.error("Auth error:", authError);
        return;
    }
    
    const user = authData.user;
    console.log("Test user created:", user.id);
    
    // Now test fetching the conversations using the normal JS client (with RLS)
    const { data: myConversations, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
        
    console.log("Query Result for current user:", myConversations);
    if (convError) console.error("Error from participant query:", convError);

    const { data: msgs, error: msgErr } = await supabase.from('messages').select('*').limit(1);
    console.log("Messages Query result:", msgs);
    if (msgErr) console.error("Messages error:", msgErr);

    const { data: convs, error: cErr } = await supabase.from('conversations').select('*').limit(1);
    console.log("Conversations Query result:", convs);
    if (cErr) console.error("Conversations error:", cErr);

    // Clean up
    await supabaseAdmin.auth.admin.deleteUser(user.id);
}

testRLS();
