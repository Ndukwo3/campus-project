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
    const testEmail = `test_${Date.now()}@test.com`;
    const testPassword = 'password123';
    
    console.log(`Creating test user ${testEmail}...`);
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
    
    // Create a profile for the user
    await supabaseAdmin.from('profiles').insert({
        id: user.id,
        username: `testuser_${Date.now()}`,
        full_name: 'Test User'
    });

    // Create a conversation using service role
    const { data: convData } = await supabaseAdmin.from('conversations').insert({}).select().single();
    const convoId = convData.id;
    
    // Insert into participants
    await supabaseAdmin.from('conversation_participants').insert([
        { conversation_id: convoId, user_id: user.id }
    ]);
    
    // Insert a message
    await supabaseAdmin.from('messages').insert({
        conversation_id: convoId,
        sender_id: user.id,
        content: "Hello world"
    });
    
    // Now test fetching the conversations using the normal JS client (with RLS)
    const { data: myConversations, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
        
    console.log("Query Result for current user:", myConversations);
    if (convError) console.error("Error from participant query:", convError);

    // Fetch messages
    const { data: myMsgs, error: msgErr } = await supabase
        .from('messages')
        .select('*');
        
    console.log("Query Messages:", myMsgs);
    if (msgErr) console.error("Error from messages query:", msgErr);

    // Clean up
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    console.log("Test user cleanup done.");
}

testRLS();
