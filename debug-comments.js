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

async function checkComments() {
    console.log("Checking comments table...");
    const { data, error } = await supabase.from('comments').select('*').limit(1);
    if (error) {
        console.error("Error fetching comments:", error);
    } else {
        console.log("Sample comment:", data[0]);
    }

    // Try to check if comment_likes exists
    const { data: likes, error: lErr } = await supabase.from('comment_likes').select('*').limit(1);
    if (lErr) {
        if (lErr.code === '42P01') {
            console.log("Table 'comment_likes' does not exist.");
        } else {
            console.error("Error fetching comment_likes:", lErr);
        }
    } else {
        console.log("Table 'comment_likes' exists.");
    }
}

checkComments();
