const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  // Try logging in using an existing user or just use service role if available
  // Since we only have anon key, we'll try querying without RLS if possible, or just observe.
  console.log("Checking DB connection...");
  const { data: conv, error } = await supabase.from('conversations').select('*').limit(1);
  console.log("Convs:", conv, error);
}

check();
