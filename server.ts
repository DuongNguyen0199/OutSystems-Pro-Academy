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
  } catch (err) {
    console.error("Error in /api/courses, using fallback:", err);
    return res.json({ source: "local", data: fallbackCourses });
  }
});

// In-memory data store for fallback/demo
const memoryPaymentRequests: any[] = [
  {
    id: "req_demo_1",
    userEmail: "student.outsystems@gmail.com",
    courseId: "48ad6d82-3994-490a-a4f4-c07f0a7a38db",
    courseTitle: "OutSystems Agentic AI Specialist (ODC)",
    amount: 29.99,
    status: "pending",
    createdAt: new Date().toISOString()
  }
];

const memoryActivationCodes: any[] = [
  {
    id: "code_demo_1",
    code: "OUT-REACTIVE-90D-DEMO",
    userEmail: "duongrbt@gmail.com",
    courseId: "70daa8a9-20c7-4993-b292-54566ef12303",
    status: "active",
    failedAttempts: 0,
    createdAt: new Date().toISOString()
  }
];

// Dynamic Notification Settings (Configurable via Admin Dashboard or Render Env)
let notificationSettings = {
  adminEmail: process.env.ADMIN_EMAIL || "duongrbt@gmail.com",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || ""
};

// Helper to send Telegram Bot Notification to Admin
async function sendTelegramAlert(message: string) {
  const botToken = notificationSettings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = notificationSettings.telegramChatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("[TELEGRAM ALERT SIMULATED TO ADMIN]:\n" + message);
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown"
      })
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to send Telegram alert:", err);
    return false;
  }
}

// Helper to send Gmail Alert via Nodemailer using Gmail App Password
async function sendAdminEmailAlert(subject: string, text: string) {
  const adminEmail = notificationSettings.adminEmail || process.env.ADMIN_EMAIL || "duongrbt@gmail.com";
  const appPassword = notificationSettings.gmailAppPassword || process.env.GMAIL_APP_PASSWORD;

  if (!adminEmail || !appPassword) {
    console.log("[GMAIL ALERT SIMULATED TO ADMIN]:\nSubject: " + subject + "\n" + text);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: adminEmail,
        pass: appPassword.replace(/\s+/g, "") // remove spaces if user formatted as xxxx xxxx xxxx xxxx
      }
    });

    await transporter.sendMail({
      from: `"OutSystems Pro Academy" <${adminEmail}>`,
      to: adminEmail,
      subject: subject,
      text: text
    });
    console.log("Email notification sent successfully to " + adminEmail);
    return true;
  } catch (err) {
    console.error("Failed to send Gmail alert:", err);
    return false;
  }
}


// Admin Auth Verification Endpoint using Render Environment Variables
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const inputEmail = (email || "").trim().toLowerCase();

  const configuredAdminEmail = (process.env.ADMIN_EMAIL || "duongrbt@gmail.com").trim().toLowerCase();
  const configuredAdminPassword = process.env.ADMIN_PASSWORD;

  if (inputEmail === configuredAdminEmail) {
    // If ADMIN_PASSWORD is defined in Render env variables, check exact match
    if (configuredAdminPassword && password !== configuredAdminPassword) {
      return res.status(401).json({ success: false, error: "Incorrect Admin Password." });
    }

    return res.json({
      success: true,
      user: {
        id: "admin_1",
        email: configuredAdminEmail,
        role: "admin",
        status: "active"
      }
    });
  }

  // Regular Student login
  return res.json({
    success: true,
    user: {
      id: "usr_" + Date.now(),
      email: inputEmail,
      role: "student",
      status: "active"
    }
  });
});

// 1. Payment Request Notification Endpoint

app.post("/api/payment-request", async (req, res) => {
  const { userEmail, courseId, courseTitle, amount } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: "User email is required." });
  }

  const newRequest = {
    id: "req_" + Date.now(),
    userEmail: userEmail.trim().toLowerCase(),
    courseId: courseId || "generic",
    courseTitle: courseTitle || "OutSystems Practice Test",
    amount: amount || 29.99,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  memoryPaymentRequests.unshift(newRequest);

  // 1. Send Telegram Notification
  const telegramMsg = `🔔 *NEW OUTSYSTEMS DUMP PAYMENT REQUEST*
📧 *User Email:* \`${userEmail}\`
📘 *Course:* ${courseTitle}
💰 *Amount:* $${amount}
⏰ *Time:* ${new Date().toLocaleString()}

👉 _Action Required:_ Check PayPal transfer and generate Activation Code via Admin Dashboard for this user.`;

  const telegramSent = await sendTelegramAlert(telegramMsg);

  // 2. Send Gmail Notification via Nodemailer App Password
  const emailSubject = `[OutSystems Dump Request] New Payment Request from ${userEmail}`;
  const emailText = `NEW PAYMENT REQUEST RECEIVED

User Email: ${userEmail}
Course: ${courseTitle}
Amount: $${amount}
Timestamp: ${new Date().toLocaleString()}

Instructions:
1. Verify PayPal payment from ${userEmail}.
2. Log into Admin Dashboard at https://outsystems-pro-academy.onrender.com
3. Generate Activation Code and email it to the student.`;

  const emailSent = await sendAdminEmailAlert(emailSubject, emailText);

  res.json({
    success: true,
    message: "Payment request submitted & Admin notified via Telegram & Email.",
    notifications: { telegram: telegramSent, email: emailSent },
    request: newRequest
  });
});

// 1.1 VietQR Automated Bank Payment Webhook (SePay / Casso Auto Activation in 3 Seconds)
app.post("/api/webhooks/vietqr", async (req, res) => {
  const { content, transferAmount, accumulator, gateway } = req.body;

  // Extract transfer description (e.g. "OUT-REACTIVE student@gmail.com")
  const textContent = (content || "").toUpperCase();

  let matchedRequest = memoryPaymentRequests.find(r => 
    textContent.includes(r.id.toUpperCase()) || textContent.includes(r.userEmail.toUpperCase())
  );

  const autoCode = `OUT-PASS-AUTO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  if (matchedRequest) {
    matchedRequest.status = "completed";
  }

  const newCodeObj = {
    id: "code_" + Date.now(),
    code: autoCode,
    userEmail: matchedRequest ? matchedRequest.userEmail : "auto.student@gmail.com",
    courseId: matchedRequest ? matchedRequest.courseId : "generic",
    status: "active",
    failedAttempts: 0,
    createdAt: new Date().toISOString()
  };

  memoryActivationCodes.unshift(newCodeObj);

  // Send Dual Instant Alerts
  const alertText = `✅ *VIETQR BANK TRANSFER RECEIVED & AUTO-ACTIVATED*
💰 *Amount:* ${transferAmount || 750000} VND (${gateway || "Bank"})
📝 *Content:* \`${content}\`
🔑 *Auto-Generated Code:* \`${autoCode}\``;

  await sendTelegramAlert(alertText);
  await sendAdminEmailAlert("[VietQR Auto-Payment] Code Auto-Issued", alertText.replace(/\*/g, ""));

  res.json({ success: true, code: autoCode });
});


// Notification Settings Management Endpoint (Role: Admin)
app.get("/api/admin/notification-settings", (req, res) => {
  res.json({
    adminEmail: notificationSettings.adminEmail,
    gmailAppPassword: notificationSettings.gmailAppPassword ? "••••••••••••••••" : "",
    hasGmailAppPassword: Boolean(notificationSettings.gmailAppPassword),
    telegramBotToken: notificationSettings.telegramBotToken ? "••••••••••••••••" : "",
    hasTelegramBotToken: Boolean(notificationSettings.telegramBotToken),
    telegramChatId: notificationSettings.telegramChatId
  });
});

app.post("/api/admin/notification-settings", (req, res) => {
  const { adminEmail, gmailAppPassword, telegramBotToken, telegramChatId } = req.body;

  if (adminEmail) notificationSettings.adminEmail = adminEmail.trim();
  if (gmailAppPassword && !gmailAppPassword.includes("••••")) {
    notificationSettings.gmailAppPassword = gmailAppPassword.trim();
  }
  if (telegramBotToken && !telegramBotToken.includes("••••")) {
    notificationSettings.telegramBotToken = telegramBotToken.trim();
  }
  if (telegramChatId) notificationSettings.telegramChatId = telegramChatId.trim();

  res.json({
    success: true,
    message: "Notification settings saved successfully!",
    settings: {
      adminEmail: notificationSettings.adminEmail,
      hasGmailAppPassword: Boolean(notificationSettings.gmailAppPassword),
      hasTelegramBotToken: Boolean(notificationSettings.telegramBotToken),
      telegramChatId: notificationSettings.telegramChatId
    }
  });
});

// Test Notifications Endpoint
app.post("/api/admin/test-telegram", async (req, res) => {
  const ok = await sendTelegramAlert("🧪 *Test Alert from OutSystems Pro Academy*\nTelegram notification integration is working perfectly!");
  res.json({ success: ok, message: ok ? "Telegram test alert sent!" : "Could not send Telegram message. Check Bot Token & Chat ID." });
});

app.post("/api/admin/test-email", async (req, res) => {
  const ok = await sendAdminEmailAlert(
    "🧪 Test Notification from OutSystems Pro Academy",
    "Gmail App Password integration is working perfectly! You will receive instant payment alerts here."
  );
  res.json({ success: ok, message: ok ? "Gmail test email sent!" : "Could not send Gmail email. Check Gmail App Password & Email address." });
});


// 2. Validate Activation Code Endpoint (Max 5 Failed Attempts Security Lock)
app.post("/api/validate-code", (req, res) => {
  const { code, userEmail, courseId } = req.body;
  const searchCode = (code || "").trim().toUpperCase();

  // Find code in memory or master demo codes
  const foundCode = memoryActivationCodes.find((c) => c.code === searchCode);

  if (!foundCode) {
    return res.json({ valid: false, message: "Activation code does not exist.", failedAttempts: 1 });
  }

  // Check if code is already locked
  if (foundCode.status === "inactive" || foundCode.failedAttempts >= 5) {
    foundCode.status = "inactive";
    return res.json({
      valid: false,
      locked: true,
      failedAttempts: foundCode.failedAttempts,
      message: "Code locked! Exceeded 5 failed attempts. Please contact Admin at duongrbt@gmail.com."
    });
  }

  // Check course / email match or universal demo code
  const isMatch = searchCode.includes("DEMO") || (
    (!foundCode.userEmail || foundCode.userEmail.toLowerCase() === (userEmail || "").toLowerCase()) &&
    (!foundCode.courseId || foundCode.courseId === courseId)
  );

  if (!isMatch) {
    foundCode.failedAttempts += 1;

    if (foundCode.failedAttempts >= 5) {
      foundCode.status = "inactive";
      return res.json({
        valid: false,
        locked: true,
        failedAttempts: 5,
        message: "Code locked! Exceeded 5 failed attempts. Please contact Admin at duongrbt@gmail.com."
      });
    }

    return res.json({
      valid: false,
      failedAttempts: foundCode.failedAttempts,
      message: `Invalid code or email mismatch. Failed attempt ${foundCode.failedAttempts} of 5.`
    });
  }

  // Code is valid! Mark as used/active
  res.json({ valid: true, message: "Code successfully verified!", code: foundCode });
});

// 3. Admin: Generate Activation Code
app.post("/api/admin/generate-code", (req, res) => {
  const { code, userEmail, courseId } = req.body;

  const newCodeObj = {
    id: "code_" + Date.now(),
    code: code || `OUT-PASS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    userEmail: (userEmail || "").trim().toLowerCase(),
    courseId: courseId || "",
    status: "active",
    failedAttempts: 0,
    createdAt: new Date().toISOString()
  };

  memoryActivationCodes.unshift(newCodeObj);
  res.json({ success: true, code: newCodeObj });
});

// 4. Admin: Get Requests & Codes
app.get("/api/admin/payment-requests", (req, res) => {
  res.json({
    requests: memoryPaymentRequests,
    codes: memoryActivationCodes
  });
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
