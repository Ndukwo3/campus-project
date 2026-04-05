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

async function checkPolicies() {
    const { data: policies, error } = await supabaseAdmin.from('pg_policies').select('*');
    if (error) {
       console.log("Could not query pg_policies via REST:", error.message);
    } else {
       console.log("Policies:", policies);
    }
}

checkPolicies();
