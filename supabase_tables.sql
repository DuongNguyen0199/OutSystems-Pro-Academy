-- ====================================================================
-- SUPABASE RELATIONAL TABLES SETUP SCRIPT
-- Copy and paste this script into your Supabase SQL Editor to:
-- 1. Create the 'preview_questions' (Free Questions) table
-- 2. Create the 'mock_exam_questions' (Exam Practice Quiz) table
-- 3. Configure RLS (Row Level Security) for public read access
-- 4. Seed the tables with real course questions (mapped to your CSV UUIDs)
-- ====================================================================

-- --------------------------------------------------
-- 1. Create 'preview_questions' (Free Questions) table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.preview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_free BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.preview_questions ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and recreate
DROP POLICY IF EXISTS "Allow public read access to preview_questions" ON public.preview_questions;
CREATE POLICY "Allow public read access to preview_questions" 
ON public.preview_questions 
FOR SELECT 
TO anon 
USING (true);


-- --------------------------------------------------
-- 2. Create 'mock_exam_questions' (Exam Practice Quiz) table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mock_exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    choices JSONB NOT NULL, -- Stores array: [{"key": "A", "text": "Choice A"}, ...]
    correct_answer VARCHAR(5) NOT NULL, -- "A", "B", "C", "D"
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.mock_exam_questions ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and recreate
DROP POLICY IF EXISTS "Allow public read access to mock_exam_questions" ON public.mock_exam_questions;
CREATE POLICY "Allow public read access to mock_exam_questions" 
ON public.mock_exam_questions 
FOR SELECT 
TO anon 
USING (true);


-- --------------------------------------------------
-- 3. Clear existing old records (Optional, safe to run)
-- --------------------------------------------------
TRUNCATE TABLE public.preview_questions CASCADE;
TRUNCATE TABLE public.mock_exam_questions CASCADE;


-- --------------------------------------------------
-- 4. Seed real questions for existing courses (Mapped by UUIDs)
-- --------------------------------------------------

-- ==========================================
-- COURSE: OutSystems Agentic AI Specialist (ODC) — NEW
-- UUID: '48ad6d82-3994-490a-a4f4-c07f0a7a38db'
-- ==========================================

-- Free Questions
INSERT INTO public.preview_questions (course_id, question, answer, is_free)
VALUES 
    (
        '48ad6d82-3994-490a-a4f4-c07f0a7a38db',
        'What is an agentic AI system in the context of OutSystems?',
        'An agentic AI system is an autonomous agent that can perceive its environment, make decisions, and take actions to achieve specific goals with minimal human intervention. In ODC, this is achieved by orchestrating LLMs with secure app integrations.',
        true
    ),
    (
        '48ad6d82-3994-490a-a4f4-c07f0a7a38db',
        'How do you integrate AI models into OutSystems applications?',
        'AI model integration in ODC is accomplished via native AI connectors (such as OpenAI, Azure, or Google Vertex AI) configured in the OutSystems Integration Manager, or via standard secure REST integrations passing OAuth/bearer tokens to LLM gateways.',
        true
    );

-- Exam Practice Quiz
INSERT INTO public.mock_exam_questions (course_id, question, choices, correct_answer, explanation)
VALUES 
    (
        '48ad6d82-3994-490a-a4f4-c07f0a7a38db',
        'Which of the following is the recommended method to secure API credentials when building an AI chatbot agent in ODC?',
        '[{"key": "A", "text": "Store the key directly as a hardcoded text literal in the client action."}, {"key": "B", "text": "Use an ODC Application Secret configured in the ODC Portal."}, {"key": "C", "text": "Save it inside a standard Local Storage variable on the user''s mobile app."}, {"key": "D", "text": "Define it inside a Site Property marked with No Encryption."}]'::jsonb,
        'B',
        'In OutSystems Developer Cloud (ODC), highly sensitive credentials and API keys must always be stored securely using "Secrets" within the ODC Portal, rather than being hardcoded in actions or client variables which can be reverse engineered.'
    ),
    (
        '48ad6d82-3994-490a-a4f4-c07f0a7a38db',
        'In agentic workflows, what is the role of a "Tool" in a Retrieval-Augmented Generation (RAG) setup?',
        '[{"key": "A", "text": "To translate the natural language user query into SQL statements manually."}, {"key": "B", "text": "To compress and convert PDF training files into image files."}, {"key": "C", "text": "To allow the LLM to access external APIs or databases to fetch real-time and domain-specific knowledge."}, {"key": "D", "text": "To handle visual animations of loading dots inside the user interface."}]'::jsonb,
        'C',
        'Tools represent the capabilities provided to an LLM agent, such as REST APIs, databases, or specialized services, allowing the agent to retrieve accurate, updated, and private domain-specific data to solve a user''s query.'
    ),
    (
        '48ad6d82-3994-490a-a4f4-c07f0a7a38db',
        'When designing a prompt template in an ODC server action, why should you implement input sanitization before forwarding the prompt to the LLM?',
        '[{"key": "A", "text": "To ensure the prompt meets HTML5 styling compliance."}, {"key": "B", "text": "To prevent prompt injection attacks where users attempt to override the system instructions."}, {"key": "C", "text": "To speed up the network latency of the REST call."}, {"key": "D", "text": "To decrease the file size of the OutSystems application package."}]'::jsonb,
        'B',
        'Just like SQL injection, prompt injection happens when malicious input tricks the LLM into disregarding its system guidelines. Sanitizing user input prevents users from manipulating the instructions embedded in the prompt template.'
    ),
    (
        '48ad6d82-3994-490a-a4f4-c07f0a7a38db',
        'What is the function of the "Temperature" parameter when interacting with a foundation model in an OutSystems action?',
        '[{"key": "A", "text": "It measures the server CPU temperature during prompt evaluation."}, {"key": "B", "text": "It controls the randomness and creativity of the generated completions."}, {"key": "C", "text": "It determines the timeout duration for the HTTP socket connection."}, {"key": "D", "text": "It specifies the visual theme mode of the AI rendering component."}]'::jsonb,
        'B',
        'The Temperature parameter controls the probability distribution of tokens. A lower temperature (near 0) makes the model more deterministic and analytical, while a higher temperature makes the output more creative and diverse.'
    );


-- ==========================================
-- COURSE: OutSystems Architecture Specialist (ODC)
-- UUID: '56c652a7-7d07-41ea-bfe7-c19acd320420'
-- ==========================================

-- Free Questions
INSERT INTO public.preview_questions (course_id, question, answer, is_free)
VALUES 
    (
        '56c652a7-7d07-41ea-bfe7-c19acd320420',
        'What is the main purpose of Domain Driven Design (DDD) in OutSystems Architecture?',
        'Domain-Driven Design (DDD) organizes modules and services into clear, logical boundaries reflecting real business domains. This minimizes cross-domain tight coupling, promotes clear APIs, and allows scaling components independently.',
        true
    ),
    (
        '56c652a7-7d07-41ea-bfe7-c19acd320420',
        'How do you prevent circular dependencies in OutSystems Cloud architecture?',
        'Circular dependencies are avoided by establishing a strict layered hierarchy (End-User, Core, Foundation) where elements only refer downward. If cross-communication is needed between side-by-side core modules, we utilize loose coupling via public events or decoupled service actions.',
        true
    );

-- Exam Practice Quiz
INSERT INTO public.mock_exam_questions (course_id, question, choices, correct_answer, explanation)
VALUES 
    (
        '56c652a7-7d07-41ea-bfe7-c19acd320420',
        'In OutSystems architecture guidelines, what is the core difference between a Server Action and a Service Action?',
        '[{"key": "A", "text": "Server Actions run on the server, while Service Actions run directly inside the browser."}, {"key": "B", "text": "Service Actions run in a separate transaction and are called via secure REST, allowing independent deployments; Server Actions run in the same transaction."}, {"key": "C", "text": "Service Actions can only connect to external databases, while Server Actions only connect to the local OutSystems DB."}, {"key": "D", "text": "Server Actions are deprecated in ODC and completely replaced by Service Actions."}]'::jsonb,
        'B',
        'Service Actions in OutSystems have separate database transactions and act as REST services under the hood, making them loosely coupled and independently deployable. Server Actions are direct library references that run in the same transaction.'
    ),
    (
        '56c652a7-7d07-41ea-bfe7-c19acd320420',
        'You have two core business modules: "Customer_CS" and "Invoice_CS". The Invoice_CS module needs to fetch customer information. How should this dependency be designed?',
        '[{"key": "A", "text": "Create a circular dependency where each module references entities of the other directly."}, {"key": "B", "text": "Invoice_CS should reference public entities or public read-only views exposed by Customer_CS to retrieve data."}, {"key": "C", "text": "Merge both Customer_CS and Invoice_CS into a single massive monolithic module."}, {"key": "D", "text": "Duplicate all customer database tables directly inside the Invoice_CS schema."}]'::jsonb,
        'B',
        'To keep a clean architectural flow, Invoice_CS (core service) should consume customer data by referencing public, read-only entities or API actions exposed by Customer_CS. This maintains single ownership of customer data inside Customer_CS.'
    ),
    (
        '56c652a7-7d07-41ea-bfe7-c19acd320420',
        'What is the fundamental benefit of splitting your application into "Foundation" modules?',
        '[{"key": "A", "text": "To group highly volatile business workflows that change daily."}, {"key": "B", "text": "To create reusable, non-business specific components (e.g., helpers, external integrations, wrappers, theme modules) that can be consumed by any core module without side-effects."}, {"key": "C", "text": "To store the master screens and final navigation UI layers."}, {"key": "D", "text": "To bypass the need for securing API endpoints."}]'::jsonb,
        'B',
        'The Foundation layer represents the bottom of the architecture stack. It contains highly reusable, agnostic modules (such as custom extensions, utility wrappers, and CSS themes) that do not contain core business logic, preventing dependencies from creeping into core domains.'
    );


-- ==========================================
-- COURSE: OutSystems Web Developer Specialist (O11)
-- UUID: '70daa8a9-20c7-4993-b292-54566ef12303'
-- ==========================================

-- Free Questions
INSERT INTO public.preview_questions (course_id, question, answer, is_free)
VALUES 
    (
        '70daa8a9-20c7-4993-b292-54566ef12303',
        'What is the difference between a Client Variable and a Site Property in OutSystems?',
        'Client Variables are saved directly on the client browser/device (persisting across sessions but vulnerable to modification), while Site Properties are global variables evaluated on the server. Site Properties are shared across all users and should never store user-specific sensitive data.',
        true
    ),
    (
        '70daa8a9-20c7-4993-b292-54566ef12303',
        'How does OutSystems handle Database Transactions for server actions?',
        'OutSystems automatically initiates a transaction at the start of a request. All server database operations (such as Create, Update, Delete) share this transaction. It is automatically committed when the request completes successfully, or rolled back if an unhandled exception occurs.',
        true
    );

-- Exam Practice Quiz
INSERT INTO public.mock_exam_questions (course_id, question, choices, correct_answer, explanation)
VALUES 
    (
        '70daa8a9-20c7-4993-b292-54566ef12303',
        'In a Reactive Web Screen, which Lifecycle Event is the most appropriate to initialize local screen variables that do NOT depend on external database aggregates?',
        '[{"key": "A", "text": "On Render"}, {"key": "B", "text": "On Destroy"}, {"key": "C", "text": "On Initialize"}, {"key": "D", "text": "On After Fetch"}]'::jsonb,
        'C',
        'On Initialize runs before the screen is rendered and before any data fetching begins. This is the optimal lifecycle hook to set initial states or read local inputs quickly without causing layout flickering.'
    ),
    (
        '70daa8a9-20c7-4993-b292-54566ef12303',
        'To display a list of customer orders with the customer''s name in a Reactive Web page, what join condition should you use in your Aggregate?',
        '[{"key": "A", "text": "Order Only with Customer (Inner Join)"}, {"key": "B", "text": "Order With or Without Customer (Left Join)"}, {"key": "C", "text": "Order Ignore Customer"}, {"key": "D", "text": "Cross Join with all systems entities"}]'::jsonb,
        'B',
        'Using a "With or Without" (Left Outer Join) ensures that all Order records are fetched even if some do not have an assigned Customer. This prevents losing records from the list due to missing associations.'
    ),
    (
        '70daa8a9-20c7-4993-b292-54566ef12303',
        'If a database aggregate fails during a screen render because of database connectivity issues, how does the OutSystems exception handler intercept this?',
        '[{"key": "A", "text": "By crashing the user''s local browser immediately."}, {"key": "B", "text": "By triggering the nearest Global Exception Handler node or screen-specific Database Exception Handler."}, {"key": "C", "text": "By executing the On Destroy event of the screen."}]'::jsonb,
        'B',
        'OutSystems utilizes an Exception Handling flow. Database exceptions trigger the database-specific exception handler if defined locally, otherwise bubble up to the All Exceptions handler or the Global Exception Handler node.'
    );


-- --------------------------------------------------
-- 5. Template for adding data to other courses
-- --------------------------------------------------
-- Simply swap out the course_id with any other UUID from your public.courses table:
--
-- INSERT INTO public.preview_questions (course_id, question, answer, is_free)
-- VALUES ('<YOUR_COURSE_UUID>', 'Your question text here', 'Your answer text here', true);
--
-- INSERT INTO public.mock_exam_questions (course_id, question, choices, correct_answer, explanation)
-- VALUES ('<YOUR_COURSE_UUID>', 'Question?', '[{"key": "A", "text": "Option A"}, {"key": "B", "text": "Option B"}]'::jsonb, 'A', 'Explanation here');
