-- ====================================================================
-- REFACTORED SUPABASE DATABASE SCHEMA FOR OUTSYSTEMS PRO ACADEMY
-- Copy and paste this script into your Supabase SQL Editor to create all 9 tables!
-- ====================================================================

-- 1. Users Table (Profiles & Roles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'student', -- 'student' or 'admin'
    status VARCHAR(20) DEFAULT 'active', -- 'active' or 'banned'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to users" ON public.users;
CREATE POLICY "Allow public access to users" ON public.users FOR ALL USING (true);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 29.99,
    platform TEXT DEFAULT 'O11', -- 'O11', 'ODC'
    is_new BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to courses" ON public.courses;
CREATE POLICY "Allow public read access to courses" ON public.courses FOR SELECT TO anon USING (true);

-- 3. Exams Table (Each course can have 1 or more practice exam sets)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time_limit_minutes INT DEFAULT 75,
    passing_score_percentage INT DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to exams" ON public.exams;
CREATE POLICY "Allow public read access to exams" ON public.exams FOR SELECT TO anon USING (true);

-- 4. Exam Questions Table
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    explanation TEXT,
    image_url TEXT,
    correct_answer VARCHAR(5) NOT NULL, -- 'A', 'B', 'C', 'D'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to exam_questions" ON public.exam_questions;
CREATE POLICY "Allow public read access to exam_questions" ON public.exam_questions FOR SELECT TO anon USING (true);

-- 5. Question Options Table (Normalized Choices)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
    option_key VARCHAR(5) NOT NULL, -- 'A', 'B', 'C', 'D'
    option_text TEXT NOT NULL
);
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to question_options" ON public.question_options;
CREATE POLICY "Allow public read access to question_options" ON public.question_options FOR SELECT TO anon USING (true);

-- 6. Orders Table (Users -> Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    course_title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'paypal', -- 'paypal', 'vietqr', 'manual'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to orders" ON public.orders;
CREATE POLICY "Allow public access to orders" ON public.orders FOR ALL USING (true);

-- 7. Enrollments Table (Users <-> Enrollments <-> Courses & Activation Codes)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    activation_code TEXT UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'locked'
    failed_attempts INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to enrollments" ON public.enrollments;
CREATE POLICY "Allow public access to enrollments" ON public.enrollments FOR ALL USING (true);

-- 8. Exam Attempts Table (Users <-> ExamAttempts <-> Exams)
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    score_percentage NUMERIC NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    user_answers JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to exam_attempts" ON public.exam_attempts;
CREATE POLICY "Allow public access to exam_attempts" ON public.exam_attempts FOR ALL USING (true);

-- 9. Reviews Table (Users <-> Reviews <-> Courses)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to reviews" ON public.reviews;
CREATE POLICY "Allow public access to reviews" ON public.reviews FOR ALL USING (true);
