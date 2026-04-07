const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMetadata() {
  console.log("Cleaning up academic_resources metadata...");

  // 1. Trim trailing spaces from all names
  // Using SQL directly via RPC if possible, or just bulk updates
  const { data: allResources, error: fetchError } = await supabase
    .from('academic_resources')
    .select('id, university_name, department_name, college_name');

  if (fetchError) {
    console.error("Fetch failed:", fetchError);
    return;
  }

  for (const res of allResources) {
    const cleanUni = res.university_name?.trim() || res.university_name;
    const cleanDept = res.department_name?.trim() || res.department_name;
    const cleanColl = res.college_name?.trim() || res.college_name;

    // Specific rename for Physiology -> Human Physiology for Unizik
    let finalDept = cleanDept;
    if (cleanUni?.includes("Nnamdi Azikiwe") && (cleanDept === "Physiology" || cleanDept === "Human Physiology")) {
      finalDept = "Human Physiology";
    }

    if (cleanUni !== res.university_name || finalDept !== res.department_name || cleanColl !== res.college_name) {
      console.log(`Fixing resource ${res.id}: "${res.university_name}" -> "${cleanUni}", "${res.department_name}" -> "${finalDept}"`);
      await supabase
        .from('academic_resources')
        .update({ 
          university_name: cleanUni, 
          department_name: finalDept,
          college_name: cleanColl 
        })
        .eq('id', res.id);
    }
  }

  // 2. Also ensure the universities and departments tables are clean
  const { data: unis } = await supabase.from('universities').select('id, name');
  for (const u of unis || []) {
    if (u.name !== u.name.trim()) {
      await supabase.from('universities').update({ name: u.name.trim() }).eq('id', u.id);
    }
  }

  const { data: depts } = await supabase.from('departments').select('id, name');
  for (const d of depts || []) {
    if (d.name !== d.name.trim()) {
      await supabase.from('departments').update({ name: d.name.trim() }).eq('id', d.id);
    }
  }

  console.log("Cleanup complete!");
}

fixMetadata();
