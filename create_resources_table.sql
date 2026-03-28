-- Create the academic_resources table
CREATE TABLE IF NOT EXISTS public.academic_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    university_name TEXT NOT NULL,
    college_name TEXT,
    department_name TEXT,
    course_code TEXT,
    course_name TEXT,
    level TEXT NOT NULL, -- "100", "200", etc.
    resource_type TEXT NOT NULL, -- "Exam Questions", "Past Paper", "Notes", "Textbook"
    status TEXT DEFAULT 'pending' NOT NULL, -- "pending", "approved", "rejected"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.academic_resources ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view approved resources"
    ON public.academic_resources FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Users can view their own pending/rejected resources"
    ON public.academic_resources FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can contribute resources"
    ON public.academic_resources FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own resources"
    ON public.academic_resources FOR DELETE
    USING (auth.uid() = owner_id);
