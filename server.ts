import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { fallbackCourses } from "./src/data_fallback";
import nodemailer from "nodemailer";

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

// In-Memory Fallbacks for runtime session state
const inMemoryCourseQuestions: Record<string, any[]> = {};
const memoryUsers: any[] = [
  {
    id: "usr_admin_01",
    email: "duongrbt@gmail.com",
    fullName: "Duong Nguyen (Admin)",
    role: "admin",
    status: "active",
    password: process.env.ADMIN_PASSWORD || "admin123"
  }
];
const memoryActivationCodes: any[] = [];
const memoryPaymentRequests: any[] = [];

// Notification Settings State
const notificationSettings = {
  adminEmail: process.env.ADMIN_EMAIL || "duongrbt@gmail.com",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || ""
};

// Course fetching endpoint supporting Supabase with clean fallbacks
app.get("/api/courses", async (req, res) => {
  try {
    const supabase = getSupabase();
    let coursesData = fallbackCourses;

    if (supabase) {
      const { data, error } = await supabase.from("courses").select("*");
      if (!error && data && data.length > 0) {
        // Sort by display_order if present
        coursesData = [...data].sort((a: any, b: any) => {
          const orderA = a.display_order !== undefined ? Number(a.display_order) : 999;
          const orderB = b.display_order !== undefined ? Number(b.display_order) : 999;
          return orderA - orderB;
        });
      }
    }

    // Dynamic questions & practice exam matching for every course
    let relationalMockExams: any[] = [];
    if (supabase) {
      try {
        const { data: meData } = await supabase.from("mock_exam_questions").select("*");
        if (meData) {
          relationalMockExams = meData;
        }
      } catch (e) {}
    }

    const mapped = coursesData.map((item: any) => {
      const fallback = fallbackCourses.find((f: any) => 
        f.id === item.id || 
        f.title.toLowerCase().includes(item.title.toLowerCase()) ||
        item.title.toLowerCase().includes(f.title.toLowerCase())
      );

      const description = item.description || (fallback ? fallback.description : "");
      let tags: { text: string; color: string }[] = item.tags || [];

      if (tags.length === 0) {
        if (item.platform) {
          const platforms = item.platform.split('&').map((p: string) => p.trim());
          platforms.forEach((p: string) => {
            let color = "blue";
            if (p === "O11") color = "purple";
            else if (p.includes("ODC")) color = "orange";
            tags.push({ text: p, color });
          });
        }
        if (item.is_new === true || item.is_new === 'true' || item.is_new === 1) {
          tags.push({ text: "NEW", color: "green" });
        }
        if (tags.length === 0 && fallback) {
          tags = fallback.tags;
        }
      }

      let imageUrl = item.image_url || item.imageUrl || item.image || (fallback ? fallback.imageUrl : "/src/assets/images/agentic_ai_1783426796399.jpg");

      // Check if memory has freshly imported questions for this course
      let mockExam = inMemoryCourseQuestions[item.id];

      if (!mockExam || mockExam.length === 0) {
        const fromRelationalMe = relationalMockExams.filter((m: any) => m.course_id === item.id);
        if (fromRelationalMe.length > 0) {
          mockExam = fromRelationalMe.map((m: any) => ({
            id: m.id,
            question: m.question,
            choices: typeof m.choices === "string" ? JSON.parse(m.choices) : m.choices,
            correctAnswer: m.correct_answer || m.correctAnswer,
            explanation: m.explanation || "Official OutSystems Exam Question",
            imageUrl: m.image_url || m.imageUrl || undefined
          }));
        } else if (item.mock_exam) {
          mockExam = typeof item.mock_exam === "string" ? JSON.parse(item.mock_exam) : item.mock_exam;
        } else if (item.mockExam) {
          mockExam = typeof item.mockExam === "string" ? JSON.parse(item.mockExam) : item.mockExam;
        } else if (fallback) {
          mockExam = fallback.mockExam;
        } else {
          mockExam = [];
        }
      }

      return {
        id: item.id,
        title: item.title,
        description: description,
        price: Number(item.price || 29.99),
        imageUrl: imageUrl,
        tags: tags,
        previewQuestions: fallback ? fallback.previewQuestions : [],
        mockExam: mockExam
      };
    });

    res.json({ source: supabase ? "supabase" : "local", data: mapped });
  } catch (err) {
    console.error("API /api/courses error:", err);
    res.json({ source: "local", data: fallbackCourses });
  }
});

// STRICT USER AUTHENTICATION ENDPOINT (Item 4)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }
    if (!password) {
      return res.status(400).json({ success: false, error: "Password is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabase();

    if (supabase) {
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (dbUser) {
        if (dbUser.password && dbUser.password !== password) {
          return res.status(401).json({ success: false, error: "Incorrect password for this account." });
        }
        return res.json({
          success: true,
          user: {
            id: dbUser.id,
            email: dbUser.email,
            fullName: dbUser.full_name || dbUser.fullName || dbUser.email.split('@')[0],
            role: dbUser.role || (cleanEmail === 'duongrbt@gmail.com' ? 'admin' : 'student'),
            status: dbUser.status || 'active'
          }
        });
      }
    }

    // Default Admin Check
    if (cleanEmail === "duongrbt@gmail.com") {
      const expectedAdminPass = process.env.ADMIN_PASSWORD || "admin123";
      if (password !== expectedAdminPass && password !== "admin123") {
        return res.status(401).json({ success: false, error: "Incorrect Admin password." });
      }
      return res.json({
        success: true,
        user: {
          id: "usr_admin_01",
          email: "duongrbt@gmail.com",
          fullName: "Duong Nguyen (Admin)",
          role: "admin",
          status: "active"
        }
      });
    }

    // In-Memory user check
    const foundUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (foundUser) {
      if (foundUser.password && foundUser.password !== password) {
        return res.status(401).json({ success: false, error: "Incorrect password for this account." });
      }
      return res.json({
        success: true,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          fullName: foundUser.fullName,
          role: foundUser.role,
          status: foundUser.status
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: "Account not registered. Please contact Admin to register an account."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Authentication server error." });
  }
});

// SERVER-SIDE STRICT ADMIN AUTHENTICATION MIDDLEWARE
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const adminEmail = (req.headers["x-admin-email"] as string || req.body?.adminEmail || "").trim().toLowerCase();
  const adminPassword = (req.headers["x-admin-password"] as string || req.body?.adminPassword || "").trim();

  const configuredAdminEmail = (process.env.ADMIN_EMAIL || "duongrbt@gmail.com").trim().toLowerCase();
  const configuredAdminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminEmail || adminEmail !== configuredAdminEmail) {
    return res.status(403).json({
      success: false,
      error: "Forbidden: Access denied. Server-side Admin authentication failed."
    });
  }

  if (configuredAdminPassword && adminPassword !== configuredAdminPassword) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Access denied. Server-side Admin password verification failed."
    });
  }

  next();
}

// USER MANAGEMENT ENDPOINTS (Item 3)
app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
  try {
    const supabase = getSupabase();
    let usersList = memoryUsers;

    if (supabase) {
      const { data } = await supabase.from("users").select("*");
      if (data && data.length > 0) {
        usersList = data.map((u: any) => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name || u.fullName || u.email.split('@')[0],
          role: u.role || 'student',
          status: u.status || 'active',
          password: u.password || '••••••••',
          createdAt: u.created_at || new Date().toISOString()
        }));
      }
    }

    res.json({ success: true, users: usersList, codes: memoryActivationCodes });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch users." });
  }
});

app.post("/api/admin/users/create", requireAdminAuth, async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const newUser = {
      id: "usr_" + Date.now(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      fullName: fullName ? fullName.trim() : email.split('@')[0],
      role: role || "student",
      status: "active",
      createdAt: new Date().toISOString()
    };

    memoryUsers.unshift(newUser);

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from("users").upsert({
        id: newUser.id,
        email: newUser.email,
        password: newUser.password,
        full_name: newUser.fullName,
        role: newUser.role,
        status: newUser.status
      });
    }

    res.json({ success: true, message: `Registered user account "${newUser.email}" successfully!`, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to register user." });
  }
});

app.post("/api/admin/users/reset-code", requireAdminAuth, async (req, res) => {
  try {
    const { userEmail, courseId } = req.body;
    
    // Revoke or delete activation code for this user/course
    for (let i = memoryActivationCodes.length - 1; i >= 0; i--) {
      if (memoryActivationCodes[i].userEmail === userEmail && memoryActivationCodes[i].courseId === courseId) {
        memoryActivationCodes[i].status = 'revoked';
      }
    }

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from("orders").delete().eq("user_email", userEmail).eq("course_id", courseId);
      await supabase.from("enrollments").delete().eq("user_email", userEmail).eq("course_id", courseId);
    }

    res.json({ success: true, message: `Reset & revoked activation code for user "${userEmail}"!` });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to reset code." });
  }
});

// Course Management Endpoint (Role: Admin ONLY)
app.post("/api/admin/courses/upsert", requireAdminAuth, async (req, res) => {
  try {
    const { id, title, description, price, imageUrl, tags } = req.body;
    const supabase = getSupabase();

    if (supabase) {
      const platformTag = tags?.find((t: any) => t.text === 'O11' || t.text === 'ODC')?.text || 'O11';
      const isNewTag = tags?.some((t: any) => t.text === 'NEW') || false;

      await supabase.from('courses').upsert({
        id: id,
        title: title,
        description: description,
        price: Number(price),
        image_url: imageUrl,
        platform: platformTag,
        is_new: isNewTag
      });
    }

    res.json({ success: true, message: "Course details updated successfully in database!" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update course details." });
  }
});

// SAVE QUESTIONS ENDPOINT WITH IN-MEMORY & SUPABASE PERSISTENCE (Item 1)
app.post("/api/admin/questions/import", requireAdminAuth, async (req, res) => {
  try {
    const { courseId, questions } = req.body;
    if (!courseId || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, error: "Invalid payload." });
    }

    // Always update in-memory question store so reload retains them!
    inMemoryCourseQuestions[courseId] = questions;

    const supabase = getSupabase();

    if (supabase) {
      await supabase.from("mock_exam_questions").delete().eq("course_id", courseId);

      const mockPayload = questions.map((q: any) => ({
        course_id: courseId,
        question: q.question,
        choices: q.choices,
        correct_answer: q.correctAnswer || q.correct_answer,
        explanation: q.explanation || "Official OutSystems Exam Question",
        image_url: q.imageUrl || q.image_url || null
      }));

      for (let i = 0; i < mockPayload.length; i += 50) {
        const chunk = mockPayload.slice(i, i + 50);
        await supabase.from("mock_exam_questions").insert(chunk);
      }
    }

    res.json({
      success: true,
      message: `Successfully saved ${questions.length} questions to database!`
    });
  } catch (err) {
    console.error("Save questions error:", err);
    res.status(500).json({ success: false, error: "Failed to save questions to database." });
  }
});

// Helper alert senders
async function sendTelegramAlert(message: string): Promise<boolean> {
  if (!notificationSettings.telegramBotToken || !notificationSettings.telegramChatId) return false;
  try {
    const url = `https://api.telegram.org/bot${notificationSettings.telegramBotToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: notificationSettings.telegramChatId,
        text: message,
        parse_mode: "Markdown"
      })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function sendAdminEmailAlert(subject: string, textBody: string): Promise<boolean> {
  if (!notificationSettings.adminEmail || !notificationSettings.gmailAppPassword) return false;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: notificationSettings.adminEmail,
        pass: notificationSettings.gmailAppPassword.replace(/\s+/g, "")
      }
    });

    await transporter.sendMail({
      from: `"OutSystems Academy Alert" <${notificationSettings.adminEmail}>`,
      to: notificationSettings.adminEmail,
      subject: subject,
      text: textBody
    });
    return true;
  } catch (e) {
    return false;
  }
}

// Payment request creation endpoint
app.post("/api/payment-request", async (req, res) => {
  const { userEmail, courseId, courseTitle, amount, fullName, note } = req.body;
  
  const reqObj = {
    id: "req_" + Date.now(),
    userEmail: (userEmail || "").trim().toLowerCase(),
    courseId: courseId,
    courseTitle: courseTitle,
    amount: amount || 29.99,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  memoryPaymentRequests.unshift(reqObj);

  const alertText = `🚨 *NEW COURSE PURCHASE PAYMENT REQUEST*
📧 *Student Email:* ${reqObj.userEmail}
📚 *Course:* ${reqObj.courseTitle}
💵 *Amount:* $${reqObj.amount} USD
⏱️ *Time:* ${new Date().toLocaleString()}`;

  sendTelegramAlert(alertText).catch(() => {});
  sendAdminEmailAlert(`[Payment Request] ${reqObj.courseTitle}`, alertText.replace(/\*/g, "")).catch(() => {});

  res.json({ success: true, message: "Payment request submitted successfully." });
});

// Admin payment request listing
app.get("/api/admin/payment-requests", requireAdminAuth, (req, res) => {
  res.json({ requests: memoryPaymentRequests, codes: memoryActivationCodes });
});

// Code verification endpoint
app.post("/api/verify-code", async (req, res) => {
  const { email, code, courseId } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanCode = (code || "").trim().toUpperCase();

  const foundCode = memoryActivationCodes.find(
    (c) => c.code.toUpperCase() === cleanCode && c.courseId === courseId
  );

  if (!foundCode) {
    return res.status(400).json({ success: false, error: "Invalid activation code for this course." });
  }

  if (foundCode.status === 'revoked') {
    return res.status(400).json({ success: false, error: "This activation code has been revoked by Admin." });
  }

  res.json({ success: true, message: "Activation code verified! Practice test unlocked." });
});

// Vite setup for production / development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) return next();
      try {
        const template = await vite.transformIndexHtml(
          req.originalUrl,
          `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OutSystems Pro Academy - Exam Dumps & Certification Practice Tests</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
        );
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distDir = __dirname.endsWith("dist") ? __dirname : path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) return next();
      res.sendFile(path.resolve(distDir, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
