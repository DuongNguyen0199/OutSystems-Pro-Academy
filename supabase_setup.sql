-- ====================================================================
-- SUPABASE COURSES SETUP SCRIPT
-- Copy and paste this script into your Supabase SQL Editor to:
-- 1. Create the 'courses' table with matching CSV schema
-- 2. Populate the table with your complete list of courses
-- ====================================================================

-- 1. Create the courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    platform TEXT,
    is_new BOOLEAN DEFAULT FALSE,
    description TEXT,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image TEXT,
    display_order INTEGER,
    
    -- Optional columns to store custom quiz questions directly in Supabase if needed
    preview_questions JSONB,
    mock_exam JSONB
);

-- Enable Row Level Security (RLS) on public table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous public users to read courses
DROP POLICY IF EXISTS "Allow public read access to courses" ON public.courses;

CREATE POLICY "Allow public read access to courses" 
ON public.courses 
FOR SELECT 
TO anon 
USING (true);

-- 2. Clear old data (optional, remove/comment out if not wanted)
TRUNCATE TABLE public.courses;

-- 3. Insert the 12 courses exactly from your CSV file
INSERT INTO public.courses (id, title, platform, is_new, description, price, created_at, image, display_order)
VALUES 
    (
        '48ad6d82-3994-490a-a4f4-c07f0a7a38db', 
        'OutSystems Agentic AI Specialist (ODC) — NEW', 
        'ODC', 
        true, 
        'Master AI integration and automation in OutSystems Developer Cloud with advanced agent-based solutions.', 
        15, 
        '2026-03-26 08:45:08.811094+00', 
        '/agenticai.png', 
        1
    ),
    (
        '56c652a7-7d07-41ea-bfe7-c19acd320420', 
        'OutSystems Architecture Specialist (ODC)', 
        'ODC', 
        true, 
        'Design scalable and maintainable applications in OutSystems Developer Cloud.', 
        14, 
        '2026-03-26 08:45:08.811094+00', 
        '/archodc.png', 
        2
    ),
    (
        '70daa8a9-20c7-4993-b292-54566ef12303', 
        'OutSystems Web Developer Specialist (O11)', 
        'O11', 
        false, 
        'Prepared and recreated right after the OutSystems exam (~80% similar to the real exam)', 
        15, 
        '2026-03-29 08:45:08.811094+00', 
        '/web.png', 
        3
    ),
    (
        'ed8ec4a7-7cfd-4004-91dd-e59eb7c6d06a', 
        'OutSystems Tech Lead (O11)', 
        'O11', 
        false, 
        'Lead technical teams and architect complex OutSystems solutions.', 
        15, 
        '2026-03-29 08:45:08.811094+00', 
        '/techlead.jpg', 
        4
    ),
    (
        '07ba0b37-306e-4ce6-898b-eeb871e802fa', 
        'OutSystems Delivery Specialist', 
        'O11 & ODC', 
        false, 
        'Master project delivery and agile methodologies in OutSystems.', 
        15, 
        '2026-03-26 08:45:08.811094+00', 
        '/delivery.jpg', 
        5
    ),
    (
        'b5c5c91c-fd9e-4e20-a8c3-91bd49bf51e7', 
        'OutSystems Platform Ops (O11)', 
        'O11', 
        false, 
        'Manage and optimize OutSystems infrastructure and operations.', 
        15, 
        '2026-03-26 08:45:08.811094+00', 
        '/platformops.jpg', 
        6
    ),
    (
        'da498c61-103d-4f46-8235-03b12e17d2c5', 
        'OutSystems Architecture Specialist (O11)', 
        'O11', 
        false, 
        '2 Practice Tests (It''s very similar to the actual exam) &  100% pass!', 
        12, 
        '2026-03-26 08:45:08.811094+00', 
        '/archo11.jpg', 
        7
    ),
    (
        '02d293d7-34ee-4251-b8e3-4359e00ac89b', 
        'OutSystems Mobile Developer Specialist (O11 and ODC)', 
        'O11 & ODC', 
        false, 
        'Create native mobile applications for iOS and Android.', 
        10, 
        '2026-03-26 08:45:08.811094+00', 
        '/mobile.jpg', 
        8
    ),
    (
        '0ebb37cf-a857-448b-b79a-092f988f1920', 
        'OutSystems Security Specialist (O11 and ODC)', 
        'O11 & ODC', 
        false, 
        'Implement security best practices and protect OutSystems applications.', 
        13, 
        '2026-03-26 08:45:08.811094+00', 
        '/security.jpg', 
        9
    ),
    (
        'a883ead8-e3a7-4043-a3c5-a7c7e1a4553b', 
        'OutSystems Front-end Developer Specialist (O11 and ODC)', 
        'O11 & ODC', 
        false, 
        'Master UI/UX development and responsive design in OutSystems.', 
        12, 
        '2026-03-26 08:45:08.811094+00', 
        '/frontend.jpg', 
        10
    ),
    (
        '56eb2f34-1180-46d9-a4fc-960b74cc8e44', 
        'OutSystems Associate Developer (O11)', 
        'O11', 
        false, 
        '2 official OutSystems question sets (100% pass).', 
        10, 
        '2026-03-26 08:45:08.811094+00', 
        '/associate.jpg', 
        11
    ),
    (
        'dfbc217d-67cf-4003-a583-b536cf4dc033', 
        'Associate Traditional Web Developer (O11)', 
        'O11', 
        false, 
        '2 official OutSystems question sets (100% pass).', 
        10, 
        '2026-03-26 08:45:08.811094+00', 
        '/traditional.png', 
        12
    );
