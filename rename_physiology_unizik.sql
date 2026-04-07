-- MIGRATION: Rename Physiology to Human Physiology for Nnamdi Azikiwe University
-- Also update all existing research materials to match the new name.

DO $$
DECLARE
    uni_id UUID;
    fbms_id UUID; -- Faculty of Basic Medical Sciences
    dept_id UUID;
BEGIN
    -- 1. Find Nnamdi Azikiwe University
    SELECT id INTO uni_id FROM universities WHERE name LIKE 'Nnamdi Azikiwe University%' LIMIT 1;
    
    IF uni_id IS NULL THEN
        RAISE NOTICE 'Nnamdi Azikiwe University not found.';
        RETURN;
    END IF;

    -- 2. Ensure the Faculty of Basic Medical Sciences exists
    INSERT INTO faculties (name, university_id)
    VALUES ('Faculty of Basic Medical Sciences', uni_id)
    ON CONFLICT (name, university_id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO fbms_id;

    -- 3. Check if "Physiology" exists and rename it
    -- Or just create "Human Physiology" if it doesn't exist
    UPDATE departments 
    SET name = 'Human Physiology', faculty_id = fbms_id
    WHERE name = 'Physiology' AND university_id = uni_id;

    -- 4. If it was not renamed (didn't exist), create it
    INSERT INTO departments (name, university_id, faculty_id)
    VALUES ('Human Physiology', uni_id, fbms_id)
    ON CONFLICT (name, university_id) DO UPDATE SET faculty_id = EXCLUDED.faculty_id
    RETURNING id INTO dept_id;

    -- 5. Update existing documents to match "Human Physiology"
    -- This ensures they show up in the Library when filtered by the new name
    UPDATE academic_resources 
    SET department_name = 'Human Physiology'
    WHERE department_name = 'Physiology' AND university_name LIKE 'Nnamdi Azikiwe University%';

    RAISE NOTICE 'Renamed Physiology to Human Physiology for Unizik successfully.';
END $$;
