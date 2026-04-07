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

async function seedHierarchy() {
  console.log("Starting seed process...");

  // 1. MOUAU Data (Already done, but safe to repeat)
  const { data: mouauList } = await supabase
    .from('universities')
    .select('id')
    .ilike('name', '%Michael Okpara%');

  for (const mouau of mouauList || []) {
    const { data: colpas } = await supabase
      .from('colleges')
      .upsert({ name: 'College of Physical and Applied Sciences (COLPAS)', university_id: mouau.id }, { onConflict: 'name, university_id' })
      .select()
      .single();

    if (colpas) {
      const depts = ['Statistics', 'Geology', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'];
      for (const name of depts) {
        await supabase.from('departments').upsert({ name, university_id: mouau.id, college_id: colpas.id }, { onConflict: 'name, university_id' });
      }
    }
  }

  // 2. Unizik Data
  const { data: unizikList } = await supabase
    .from('universities')
    .select('id, name')
    .ilike('name', '%Nnamdi Azikiwe%');

  console.log(`Found ${unizikList?.length} Unizik entries.`);

  for (const unizik of unizikList || []) {
    console.log(`Seeding for ${unizik.name}...`);
    const { data: fbms } = await supabase
      .from('faculties')
      .upsert({ name: 'Faculty of Basic Medical Sciences', university_id: unizik.id }, { onConflict: 'name, university_id' })
      .select()
      .single();

    if (fbms) {
      const depts = ['Human Physiology', 'Anatomy', 'Biochemistry'];
      for (const name of depts) {
        await supabase.from('departments').upsert({ name, university_id: unizik.id, faculty_id: fbms.id }, { onConflict: 'name, university_id' });
      }
    }
    
    // Also seed COLPAS-like for other faculties just in case
    const { data: engineering } = await supabase
      .from('faculties')
      .upsert({ name: 'Faculty of Engineering', university_id: unizik.id }, { onConflict: 'name, university_id' })
      .select()
      .single();
    
    if (engineering) {
       const depts = ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'];
       for (const name of depts) {
         await supabase.from('departments').upsert({ name, university_id: unizik.id, faculty_id: engineering.id }, { onConflict: 'name, university_id' });
       }
    }
  }

  console.log("Seed complete.");
}

seedHierarchy();
