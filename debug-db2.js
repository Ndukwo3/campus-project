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

    const { data: convos } = await supabase.from('conversations').select('*');
    const { data: parts } = await supabase.from('conversation_participants').select('*');
    const { data: msgs } = await supabase.from('messages').select('*');

    // Display a random conversation that has messages
    const convoWithMsg = msgs[0]?.conversation_id;
    if (convoWithMsg) {
        console.log("Analyzing Conversation ID:", convoWithMsg);
        const thisParts = parts.filter(p => p.conversation_id === convoWithMsg);
        console.log("Participants in this convo:", thisParts);
        const thisMsgs = msgs.filter(m => m.conversation_id === convoWithMsg);
        console.log("Messages in this convo:", thisMsgs.map(m => ({ sender: m.sender_id, content: m.content })));
    } else {
        console.log("No messages found.");
    }
}

inspectDb();
