import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { fallbackCourses } from "./src/data_fallback";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Supabase client to prevent startup crash if keys are not set
let supabaseClient: any = null;

function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      console.log("Supabase credentials not fully configured. Using local fallback database.");
      return null;
    }
    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
}

// Course fetching endpoint supporting Supabase with clean fallbacks
app.get("/api/courses", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.json({ source: "local", data: fallbackCourses });
    }

    // Try fetching with display_order sorting
    let query = supabase.from("courses").select("*");
    
    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error, falling back to local data:", error);
      return res.json({ source: "local", data: fallbackCourses });
    }

    if (!data || data.length === 0) {
      console.log("Supabase table 'courses' is empty, returning fallback data.");
      return res.json({ source: "local", data: fallbackCourses });
    }

    // Sort by display_order if present
    const sortedData = [...data].sort((a: any, b: any) => {
      const orderA = a.display_order !== undefined ? Number(a.display_order) : (a.displayOrder !== undefined ? Number(a.displayOrder) : 999);
      const orderB = b.display_order !== undefined ? Number(b.display_order) : (b.displayOrder !== undefined ? Number(b.displayOrder) : 999);
      return orderA - orderB;
    });

    // Attempt to fetch from relational tables if they exist
    let relationalPreviewQuestions: any[] = [];
    let relationalMockExams: any[] = [];

    try {
      const { data: pqData, error: pqError } = await supabase.from("preview_questions").select("*");
      if (!pqError && pqData) {
        relationalPreviewQuestions = pqData;
      }
    } catch (pqErr) {
      console.log("preview_questions table is not created yet or empty, falling back to JSON columns or file.");
    }

    try {
      const { data: meData, error: meError } = await supabase.from("mock_exam_questions").select("*");
      if (!meError && meData) {
        relationalMockExams = meData;
      }
    } catch (meErr) {
      console.log("mock_exam_questions table is not created yet or empty, falling back to JSON columns or file.");
    }

    // Map columns dynamically to support both camelCase and snake_case, and provided CSV schema
    const mapped = sortedData.map((item: any) => {
      // Find matching local fallback course for interactive quizzes
      const fallback = fallbackCourses.find((f: any) => 
        f.id === item.id || 
        f.title.toLowerCase().includes(item.title.toLowerCase()) ||
        item.title.toLowerCase().includes(f.title.toLowerCase())
      );

      // Extract description
      const description = item.description || (fallback ? fallback.description : "");

      // Handle tags: generate dynamically from platform & is_new
      let tags: { text: string; color: string }[] = [];
      
      if (item.platform) {
        // e.g. "O11 & ODC" or "ODC"
        const platforms = item.platform.split('&').map((p: string) => p.trim());
        platforms.forEach((p: string) => {
          let color = "blue";
          if (p === "O11") color = "purple";
          else if (p.includes("ODC") && p.includes("O11")) color = "orange";
          tags.push({ text: p, color });
        });
      }

      // Add NEW tag if is_new is true
      if (item.is_new === true || item.is_new === 'true' || item.is_new === 1) {
        tags.push({ text: "NEW", color: "green" });
      }

      // Fallback tags if none generated
      if (tags.length === 0 && fallback) {
        tags = fallback.tags;
      }

      // Map image path to local beautiful assets if match found
      let imageUrl = item.image || item.image_url || item.imageUrl;
      if (imageUrl) {
        if (imageUrl === '/archodc.png') imageUrl = '/src/assets/images/architecture_specialist_1783426813087.jpg';
        else if (imageUrl === '/web.png') imageUrl = '/src/assets/images/web_developer_1783426831823.jpg';
        else if (imageUrl === '/agenticai.png') imageUrl = '/src/assets/images/agentic_ai_1783426796399.jpg';
        else if (imageUrl === '/techlead.jpg') imageUrl = '/src/assets/images/architecture_specialist_1783426813087.jpg'; // use beautiful arch illustration
        else if (imageUrl === '/delivery.jpg') imageUrl = '/src/assets/images/agentic_ai_1783426796399.jpg';
        else if (imageUrl === '/platformops.jpg') imageUrl = '/src/assets/images/architecture_specialist_1783426813087.jpg';
        else if (imageUrl === '/archo11.jpg') imageUrl = '/src/assets/images/architecture_specialist_1783426813087.jpg';
        else if (imageUrl === '/mobile.jpg') imageUrl = '/src/assets/images/web_developer_1783426831823.jpg';
        else if (imageUrl === '/security.jpg') imageUrl = '/src/assets/images/agentic_ai_1783426796399.jpg';
        else if (imageUrl === '/frontend.jpg') imageUrl = '/src/assets/images/web_developer_1783426831823.jpg';
        else if (imageUrl === '/associate.jpg') imageUrl = '/src/assets/images/web_developer_1783426831823.jpg';
        else if (imageUrl === '/traditional.png') imageUrl = '/src/assets/images/web_developer_1783426831823.jpg';
        else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
          imageUrl = '/' + imageUrl;
        }
      } else if (fallback) {
        imageUrl = fallback.imageUrl;
      } else {
        imageUrl = '/src/assets/images/agentic_ai_1783426796399.jpg';
      }

      // Dynamic questions & practice exam matching
      let previewQuestions = [];
      const fromRelationalPq = relationalPreviewQuestions.filter((q: any) => q.course_id === item.id);
      
      if (fromRelationalPq.length > 0) {
        previewQuestions = fromRelationalPq.map((q: any) => ({
          id: q.id,
          question: q.question,
          answer: q.answer,
          isFree: q.is_free !== undefined ? q.is_free : true
        }));
      } else if (item.preview_questions) {
        previewQuestions = typeof item.preview_questions === "string" ? JSON.parse(item.preview_questions) : item.preview_questions;
      } else if (item.previewQuestions) {
        previewQuestions = typeof item.previewQuestions === "string" ? JSON.parse(item.previewQuestions) : item.previewQuestions;
      } else if (fallback) {
        previewQuestions = fallback.previewQuestions;
      } else {
        // generic preview questions if none exist
        previewQuestions = [
          {
            id: `gen-q1-${item.id}`,
            question: "What is the key focus of this OutSystems specialization?",
            answer: `This course covers advanced concepts, best practices, and official certification preparation guidelines for ${item.title}.`,
            isFree: true
          }
        ];
      }

      let mockExam = [];
      const fromRelationalMe = relationalMockExams.filter((m: any) => m.course_id === item.id);

      if (fromRelationalMe.length > 0) {
        mockExam = fromRelationalMe.map((m: any) => ({
          id: m.id,
          question: m.question,
          choices: typeof m.choices === "string" ? JSON.parse(m.choices) : m.choices,
          correctAnswer: m.correct_answer || m.correctAnswer,
          explanation: m.explanation
        }));
      } else if (item.mock_exam) {
        mockExam = typeof item.mock_exam === "string" ? JSON.parse(item.mock_exam) : item.mock_exam;
      } else if (item.mockExam) {
        mockExam = typeof item.mockExam === "string" ? JSON.parse(item.mockExam) : item.mockExam;
      } else if (fallback) {
        mockExam = fallback.mockExam;
      } else {
        // Fallback demo questions for other courses to make them fully functional!
        mockExam = [
          {
            id: `gen-m1-${item.id}`,
            question: `When deploying an application inside OutSystems, which component handles the automated compilation into standard optimized code?`,
            choices: [
              { key: 'A', text: 'The Service Studio visual designer local cache.' },
              { key: 'B', text: 'The OutSystems Deployment Controller Server (Compiler).' },
              { key: 'C', text: 'The standard web browser client engine.' },
              { key: 'D', text: 'The local database transaction manager.' }
            ],
            correctAnswer: 'B',
            explanation: 'The Deployment Controller Server is responsible for receiving visual OML files, converting them into native application code (.NET/C# and JavaScript), compiling them, and distributing the binaries to front-end servers.'
          },
          {
            id: `gen-m2-${item.id}`,
            question: `In OutSystems developer practices, what is the best way to ensure application security when retrieving sensitive database records?`,
            choices: [
              { key: 'A', text: 'Filter records using client-side actions after retrieving the full database table.' },
              { key: 'B', text: 'Enforce proper permissions in server aggregate filters and use secure SSL parameters.' },
              { key: 'C', text: 'Disable database indexing for sensitive text columns.' },
              { key: 'D', text: 'Store the connection strings in plain text client variables.' }
            ],
            correctAnswer: 'B',
            explanation: 'Security must always be enforced at the server-side aggregate layer, filtering query parameters to return only records the authenticated user is authorized to view.'
          }
        ];
      }

      return {
        id: item.id,
        title: item.title,
        price: Number(item.price),
        tags: tags,
        description: description,
        imageUrl: imageUrl,
        previewQuestions: previewQuestions,
        mockExam: mockExam
      };
    });

    return res.json({ source: "supabase", data: mapped });
  } catch (err: any) {
    console.error("Critical error in /api/courses, using local fallback:", err);
    return res.json({ source: "local", data: fallbackCourses });
  }
});

// Lazy initialize Gemini API only when the endpoint is first requested to handle missing keys gracefully.
let aiClient: GoogleGenAI | null = null;


function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. AI Tutor features will fail gracefully.");
      throw new Error("GEMINI_API_KEY environment variable is required for AI Study Tutor.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI explanation tutor proxy endpoint
app.post("/api/explain", async (req, res) => {
  const { courseTitle, question, choices, correctAnswer, userAnswer } = req.body;

  try {
    const ai = getGeminiClient();
    
    const choicesStr = choices
      .map((c: { key: string; text: string }) => `${c.key}: ${c.text}`)
      .join("\n");

    const prompt = `You are a friendly expert OutSystems Certification Coach.

Course: ${courseTitle}
Question: ${question}
Choices:
${choicesStr}

Correct Answer: ${correctAnswer}
User's Selected Answer: ${userAnswer}

Provide a clear and highly educational explanation explaining:
1. Why choice "${correctAnswer}" is correct.
2. Why choice "${userAnswer}" was incorrect (or congratulate them if they answered correctly).
3. A valuable OutSystems architectural or developer best-practice tip related to this topic.

Keep your response friendly, clear, concise, and structured. Max 200 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || "No explanation returned by the AI Tutor.";
    res.json({ explanation: text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ 
      error: "Could not fetch AI Tutor explanation.", 
      message: error.message || String(error) 
    });
  }
});

// Vite middleware configuration for serving the client-side single page app
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static client assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
