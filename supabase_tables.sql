-- ====================================================================
-- SUPABASE RELATIONAL TABLES SETUP SCRIPT FOR OUTSYSTEMS PRO ACADEMY
-- Copy and paste this script into your Supabase SQL Editor to create all 6 tables!
-- ====================================================================

-- 1. Create 'courses' table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 29.99,
    platform TEXT DEFAULT 'O11',
    is_new BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to courses" ON public.courses;
CREATE POLICY "Allow public read access to courses" ON public.courses FOR SELECT TO anon USING (true);

-- 2. Create 'mock_exam_questions' (Exam Practice Quiz) table
CREATE TABLE IF NOT EXISTS public.mock_exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    choices JSONB NOT NULL, -- Stores array: [{"key": "A", "text": "Choice A"}, ...]
    correct_answer VARCHAR(5) NOT NULL, -- "A", "B", "C", "D"
    explanation TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.mock_exam_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to mock_exam_questions" ON public.mock_exam_questions;
CREATE POLICY "Allow public read access to mock_exam_questions" ON public.mock_exam_questions FOR SELECT TO anon USING (true);

-- 3. Create 'preview_questions' table
CREATE TABLE IF NOT EXISTS public.preview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_free BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.preview_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to preview_questions" ON public.preview_questions;
CREATE POLICY "Allow public read access to preview_questions" ON public.preview_questions FOR SELECT TO anon USING (true);

-- 4. Create 'profiles' table for User Roles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'student', -- 'student' or 'admin'
    status VARCHAR(20) DEFAULT 'active', -- 'active' or 'banned'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to profiles" ON public.profiles;
CREATE POLICY "Allow public access to profiles" ON public.profiles FOR ALL USING (true);

-- 5. Create 'payment_requests' table
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to payment_requests" ON public.payment_requests;
CREATE POLICY "Allow public access to payment_requests" ON public.payment_requests FOR ALL USING (true);

-- 6. Create 'activation_codes' table (Max 5 failed attempts security lock)
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    user_email TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'used'
    failed_attempts INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to activation_codes" ON public.activation_codes;
CREATE POLICY "Allow public access to activation_codes" ON public.activation_codes FOR ALL USING (true);
