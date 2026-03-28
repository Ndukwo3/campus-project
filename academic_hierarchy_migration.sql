-- MIGRATION: Hierarchy for Academic Resources
-- Universities (already exists), Faculties, Colleges, Departments

CREATE TABLE IF NOT EXISTS public.faculties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE
);

ALTER TABLE public.faculties DROP CONSTRAINT IF EXISTS faculties_name_university_id_key;
ALTER TABLE public.faculties ADD CONSTRAINT faculties_name_university_id_key UNIQUE(name, university_id);

CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.faculties(id) ON DELETE SET NULL
);

ALTER TABLE public.colleges DROP CONSTRAINT IF EXISTS colleges_name_university_id_key;
ALTER TABLE public.colleges ADD CONSTRAINT colleges_name_university_id_key UNIQUE(name, university_id);

-- Update departments to link to faculties and colleges
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES public.faculties(id) ON DELETE SET NULL;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view faculties" ON public.faculties;
CREATE POLICY "Anyone can view faculties" ON public.faculties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view colleges" ON public.colleges;
CREATE POLICY "Anyone can view colleges" ON public.colleges FOR SELECT USING (true);

-- SEED DATA for MOUAU (College-based)
DO $$
DECLARE
    uni_id UUID;
    col_id UUID;
BEGIN
    SELECT id INTO uni_id FROM universities WHERE name LIKE 'Michael Okpara University%' LIMIT 1;
    
    IF uni_id IS NOT NULL THEN
        -- College of Applied Food Sciences and Tourism (CAFST)
        INSERT INTO colleges (name, university_id) VALUES ('College of Applied Food Sciences and Tourism (CAFST)', uni_id)
        ON CONFLICT (name, university_id) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO col_id;
        
        IF col_id IS NOT NULL THEN
            INSERT INTO departments (name, university_id, college_id) VALUES ('Food Science and Technology', uni_id, col_id) 
            ON CONFLICT (name, university_id) DO NOTHING;
            INSERT INTO departments (name, university_id, college_id) VALUES ('Home Science, Hospitality and Tourism Management', uni_id, col_id) 
            ON CONFLICT (name, university_id) DO NOTHING;
        END IF;

        -- College of Engineering and Engineering Technology (CEET)
        INSERT INTO colleges (name, university_id) VALUES ('College of Engineering and Engineering Technology (CEET)', uni_id)
        ON CONFLICT (name, university_id) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO col_id;
        
        IF col_id IS NOT NULL THEN
            INSERT INTO departments (name, university_id, college_id) VALUES ('Mechanical Engineering', uni_id, col_id) 
            ON CONFLICT (name, university_id) DO NOTHING;
            INSERT INTO departments (name, university_id, college_id) VALUES ('Electrical and Electronics Engineering', uni_id, col_id) 
            ON CONFLICT (name, university_id) DO NOTHING;
        END IF;
    END IF;
END $$;
