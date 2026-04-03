const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkColumns() {
  const { data, error } = await supabase.from('posts').select('*').limit(1);
  if (error) {
    console.error("Posts Error:", error);
  } else {
    console.log("Posts Columns:", Object.keys(data[0] || {}));
  }

  const { data: fData, error: fError } = await supabase.from('friends').select('*').limit(1);
  if (fError) {
    console.error("Friends Error:", fError);
  } else {
    console.log("Friends Columns:", Object.keys(fData[0] || {}));
  }
}

checkColumns();
