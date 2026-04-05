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

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function findDuplicateConvos() {
    console.log("Checking for duplicate conversations between same users...");
    
    const { data: participants, error } = await supabaseAdmin
        .from('conversation_participants')
        .select('conversation_id, user_id');
        
    if (error) {
        console.error("Error fetching participants:", error);
        return;
    }

    // Map conversation_id to list of user_ids
    const convoMap = {};
    participants.forEach(p => {
        if (!convoMap[p.conversation_id]) convoMap[p.conversation_id] = [];
        convoMap[p.conversation_id].push(p.user_id);
    });

    // Sort user_ids for each convo to create a unique key
    const uniquePairs = {}; // key: sorted_user_ids, value: list of conversation_ids
    
    Object.entries(convoMap).forEach(([convoId, userIds]) => {
        if (userIds.length === 2) { // Focus on 1-on-1
            const key = userIds.sort().join(':');
            if (!uniquePairs[key]) uniquePairs[key] = [];
            uniquePairs[key].push(convoId);
        }
    });

    const duplicates = Object.entries(uniquePairs).filter(([key, ids]) => ids.length > 1);
    
    if (duplicates.length === 0) {
        console.log("No duplicate 1-on-1 conversations found.");
    } else {
        console.log(`Found ${duplicates.length} pairs with duplicate conversations:`);
        duplicates.forEach(([key, ids]) => {
            console.log(`- Users [${key}] have ${ids.length} conversations: ${ids.join(', ')}`);
        });
    }
}

findDuplicateConvos();
