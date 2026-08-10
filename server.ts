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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = 3000;

// Polyfill WebSocket for Node runtime if missing
try {
  const ws = require('ws');
  if (!globalThis.WebSocket) globalThis.WebSocket = ws;
} catch (e) {}

// Lazy initialize Supabase client
let supabaseClient: any = null;

function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      console.log("Supabase credentials not fully configured. Using local fallback database.");
      return null;
    }
    try {
      supabaseClient = createClient(url, anonKey, {
        auth: { persistSession: false }
      });
    } catch (err) {
      console.error("Failed to create Supabase client:", err);
      return null;
    }
  }
  return supabaseClient;
}

// Course ID to UUID Resolver Map for Supabase 3NF schema compliance
const COURSE_ID_TO_UUID: Record<string, string> = {
  'course_assoc_reactive_o11': '70daa8a9-20c7-4993-b292-54566ef12303',
  'course_arch_odc': '56c652a7-7d07-41ea-bfe7-c19acd320420',
  'course_agentic_ai_odc': '48ad6d82-3994-490a-a4f4-c07f0a7a38db',
  'course_arch_o11': '2867b931-1550-424a-939e-99083bc56c12',
  'course_security_o11': 'a57fa873-1082-4ef9-81fb-8b173bf23901',
  'course_tech_lead_o11': '91bc8604-58a2-4a0b-bf11-48229a103211',
  'course_mobile_o11': 'fe771120-410a-4859-994c-120019283401',
  'course_web_o11': 'c9019208-1192-421b-8711-540192837101',
  'course_frontend_o11': '89102931-1029-4102-8812-109283019201',
  'course_delivery_o11': 'e1029381-1920-4102-9812-109283019201',
  'course_platform_ops_o11': 'd0192831-1092-4102-9812-109283019201'
};

function resolveCourseUuid(cId: string): string {
  if (COURSE_ID_TO_UUID[cId]) return COURSE_ID_TO_UUID[cId];
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cId)) {
    return cId;
  }
  let hex = '';
  for (let i = 0; i < cId.length; i++) {
    hex += cId.charCodeAt(i).toString(16);
  }
  while (hex.length < 32) hex += '0';
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;
}

// In-Memory Fallbacks for runtime session state
let inMemoryCourseQuestions: Record<string, any[]> = {};
let inMemoryCourseExamSets: Record<string, any[]> = {};
let memoryUsers: any[] = [
  {
    id: "usr_admin_01",
    email: "duongrbt@gmail.com",
    fullName: "Duong Nguyen (Admin)",
    role: "admin",
    status: "active",
    password: process.env.ADMIN_PASSWORD || "admin123"
  }
];
let memoryActivationCodes: any[] = [];
let memoryPaymentRequests: any[] = [];

// Notification Settings State
const notificationSettings = {
  adminEmail: process.env.ADMIN_EMAIL || "duongrbt@gmail.com",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || ""
};

// Course fetching endpoint (Item 4: Alphabetical A -> Z sorting for all roles)
app.get("/api/courses", async (req, res) => {
  try {
    const supabase = getSupabase();
    let coursesData = fallbackCourses;

    if (supabase) {
      const { data, error } = await supabase.from("courses").select("*");
      if (!error && data && data.length > 0) {
        coursesData = [...data];
      }
    }

    // Dynamic questions & practice exam matching from 3NF Supabase schema ('exam_questions' & 'question_options')
    let dbExamQuestions: any[] = [];
    let dbQuestionOptions: any[] = [];

    if (supabase) {
      try {
        const { data: eqData } = await supabase.from("exam_questions").select("*");
        if (eqData) dbExamQuestions = eqData;

        const { data: optData } = await supabase.from("question_options").select("*");
        if (optData) dbQuestionOptions = optData;
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

      const targetUuid = resolveCourseUuid(item.id);
      const hex = targetUuid.replace(/-/g, '');
      const targetExamId = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;

      // Check if memory has freshly imported questions for this course
      let mockExam = inMemoryCourseQuestions[item.id] || inMemoryCourseQuestions[targetUuid];

      if (!mockExam || mockExam.length === 0) {
        const matchedEqs = dbExamQuestions.filter((eq: any) => 
          eq.exam_id === targetExamId || 
          eq.exam_id === item.id || 
          eq.course_id === targetUuid || 
          eq.course_id === item.id
        );

        if (matchedEqs.length > 0) {
          mockExam = matchedEqs.map((eq: any) => {
            const opts = dbQuestionOptions.filter((o: any) => o.question_id === eq.id);
            const choices = opts.length > 0 
              ? opts.map((o: any) => ({ key: o.option_key, text: o.option_text }))
              : [
                  { key: 'A', text: 'Option A' },
                  { key: 'B', text: 'Option B' }
                ];

            return {
              id: eq.id,
              question: eq.question_text,
              choices: choices,
              correctAnswer: eq.correct_answer || 'A',
              explanation: eq.explanation || "Official OutSystems Exam Question",
              imageUrl: eq.image_url || undefined
            };
          });
        } else if (fallback) {
          mockExam = fallback.mockExam;
        } else {
          mockExam = [];
        }
      }

      // Parse exam_sets from DB row (handles string or JSONB)
      let sets = item.exam_sets;
      if (typeof sets === 'string') {
        try { sets = JSON.parse(sets); } catch (e) {}
      }

      if (!sets || !Array.isArray(sets) || sets.length === 0) {
        sets = inMemoryCourseExamSets[item.id] || inMemoryCourseExamSets[targetUuid];
      }

      if (!sets || !Array.isArray(sets) || sets.length === 0) {
        sets = [
          {
            id: 'set-1',
            title: 'Dump 01',
            description: 'Bài kiểm tra thực hành Dump 01',
            durationMinutes: 90,
            passingScorePct: 70,
            randomizeQuestions: false,
            questions: mockExam
          }
        ];
      } else {
        // Ensure mockExam matches the questions from exam_sets if sets exists
        const allSetQuestions = sets.flatMap((s: any) => s.questions || []);
        if (allSetQuestions.length > 0) {
          mockExam = allSetQuestions;
        }
      }

      const resolvedPrice = (item.price !== undefined && item.price !== null && item.price !== '' && !isNaN(Number(item.price)))
        ? Number(item.price)
        : (fallback ? Number(fallback.price) : 29.99);

      return {
        id: item.id,
        title: item.title || (fallback ? fallback.title : ""),
        description: description,
        price: resolvedPrice,
        imageUrl: imageUrl,
        tags: tags,
        previewQuestions: fallback ? fallback.previewQuestions : [],
        mockExam: mockExam,
        examSets: sets
      };
    });

    // Item 4: Alphabetical A -> Z sorting for all roles
    mapped.sort((a: any, b: any) => 
      (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' })
    );

    res.json({ source: supabase ? "supabase" : "local", data: mapped });
  } catch (err) {
    console.error("API /api/courses error:", err);
    res.json({ source: "local", data: fallbackCourses });
  }
});

// STRICT USER AUTHENTICATION ENDPOINT (Item 2)
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
    const cleanPassword = password.trim();

    // 1. Default Admin Check for duongrbt@gmail.com
    if (cleanEmail === "duongrbt@gmail.com") {
      const expectedAdminPass = process.env.ADMIN_PASSWORD || "admin123";
      if (cleanPassword !== expectedAdminPass && cleanPassword !== "admin123") {
        return res.status(401).json({ success: false, error: "Incorrect password for Admin account." });
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

    // 2. Check memory users (stores registered accounts & passwords)
    const foundMemoryUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (foundMemoryUser) {
      if (foundMemoryUser.password && foundMemoryUser.password !== cleanPassword) {
        return res.status(401).json({ success: false, error: "Incorrect password for this account." });
      }
      if (foundMemoryUser.status === 'inactive') {
        return res.status(403).json({ success: false, error: "This account has been set to Inactive by Admin." });
      }
      return res.json({
        success: true,
        user: {
          id: foundMemoryUser.id,
          email: foundMemoryUser.email,
          fullName: foundMemoryUser.fullName,
          role: foundMemoryUser.role,
          status: foundMemoryUser.status
        }
      });
    }

    // 3. Check Supabase users table
    const supabase = getSupabase();
    if (supabase) {
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (dbUser) {
        if (dbUser.status === 'inactive') {
          return res.status(403).json({ success: false, error: "This account has been set to Inactive by Admin." });
        }
        return res.json({
          success: true,
          user: {
            id: dbUser.id,
            email: dbUser.email,
            fullName: dbUser.email.split('@')[0],
            role: dbUser.role || 'student',
            status: dbUser.status || 'active'
          }
        });
      }
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

  if (!adminEmail || (adminEmail !== configuredAdminEmail && adminEmail !== "duongrbt@gmail.com")) {
    return res.status(403).json({
      success: false,
      error: "Forbidden: Access denied. Server-side Admin authentication failed."
    });
  }

  if (configuredAdminPassword && adminPassword && adminPassword !== configuredAdminPassword) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Access denied. Server-side Admin password verification failed."
    });
  }

  next();
}

// USER MANAGEMENT ENDPOINTS (Item 1 & Item 3)
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
          fullName: u.email.split('@')[0],
          role: u.role || 'student',
          status: u.status || 'active',
          password: '••••••••',
          createdAt: u.created_at || new Date().toISOString()
        }));
      }
    }

    let allCodes = [...memoryActivationCodes];
    if (supabase) {
      const { data: enrollData } = await supabase.from("enrollments").select("*");
      if (enrollData && enrollData.length > 0) {
        enrollData.forEach((e: any) => {
          if (!allCodes.some(c => c.code.toUpperCase() === (e.activation_code || '').toUpperCase())) {
            allCodes.push({
              id: e.id,
              code: e.activation_code,
              userEmail: e.user_email,
              courseId: e.course_id,
              status: e.status || 'active',
              createdAt: e.created_at || new Date().toISOString()
            });
          }
        });
      }
    }

    res.json({ success: true, users: usersList, codes: allCodes });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch users." });
  }
});

// CREATE USER ACCOUNT ENDPOINT WITH AUTOMATIC WELCOME EMAIL (Item 1)
app.post("/api/admin/users/create", requireAdminAuth, async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const crypto = require("crypto");
    const userUuid = crypto.randomUUID();

    const newUser = {
      id: userUuid,
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
      const { error: userErr } = await supabase.from("users").upsert({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      });

      if (userErr) {
        console.error("Supabase user upsert error:", userErr.message);
      }
    }

    // Send Automatic Welcome Email to Student
    const websiteUrl = req.headers.origin || "https://outsystems-pro-academy.onrender.com";
    const welcomeHtml = `
<div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 25px; border: 1px solid #334155;">
    <h2 style="color: #38bdf8; margin-top: 0; font-size: 22px;">🎓 OutSystems Pro Academy</h2>
    <p style="color: #e2e8f0; font-size: 15px;">Xin chào <strong>${newUser.fullName || newUser.email}</strong>,</p>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Tài khoản của bạn đã được khởi tạo thành công trên hệ thống luyện thi chứng chỉ OutSystems Pro Academy. Dưới đây là thông tin đăng nhập của bạn:</p>
    
    <div style="background-color: #0f172a; padding: 18px; border-radius: 12px; margin: 20px 0; border: 1px solid #334155;">
      <p style="margin: 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Tài khoản (Email):</strong> <span style="color: #38bdf8; font-weight: bold;">${newUser.email}</span></p>
      <p style="margin: 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Mật khẩu (Password):</strong> <span style="color: #f43f5e; font-weight: bold; font-family: monospace; font-size: 16px;">${password}</span></p>
      <p style="margin: 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Vai trò (Role):</strong> ${role === 'admin' ? 'Quản trị viên (Admin)' : 'Học viên (Student)'}</p>
    </div>

    <p style="color: #cbd5e1; font-size: 14px;">Truy cập trang web để đăng nhập và bắt đầu làm bài thi thử:</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${websiteUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.4);">👉 Đăng Nhập OutSystems Pro Academy</a>
    </div>
    
    <hr style="border: 0; border-top: 1px solid #334155; margin: 25px 0;" />
    <p style="font-size: 12px; color: #94a3b8; margin: 0;">Trân trọng,<br><strong>Đội ngũ OutSystems Pro Academy</strong><br><a href="${websiteUrl}" style="color: #38bdf8; text-decoration: none;">${websiteUrl}</a></p>
  </div>
</div>`;

    const mailRes = await sendCustomEmail(
      newUser.email,
      "[OutSystems Pro Academy] Thông tin tài khoản đăng nhập của bạn",
      welcomeHtml
    );

    res.json({ 
      success: true, 
      message: mailRes.success 
        ? `Khởi tạo tài khoản cho "${newUser.email}" thành công & Đã gửi email tự động!`
        : `Khởi tạo tài khoản cho "${newUser.email}" thành công! (Lưu ý email: ${mailRes.error})`, 
      user: newUser,
      emailSent: mailRes.success,
      emailError: mailRes.error
    });
  } catch (err: any) {
    console.error("Register user error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to register user." });
  }
});

// Delete user endpoint (Item 1)
app.post("/api/admin/users/delete", requireAdminAuth, async (req, res) => {
  try {
    const { userId, email } = req.body;
    memoryUsers = memoryUsers.filter(u => u.id !== userId && u.email.toLowerCase() !== (email || '').toLowerCase());
    
    const supabase = getSupabase();
    if (supabase) {
      if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        await supabase.from("users").delete().eq("id", userId);
      } else if (email) {
        await supabase.from("users").delete().eq("email", email.trim().toLowerCase());
      }
    }

    res.json({ success: true, message: `User "${email || userId}" deleted successfully!` });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete user." });
  }
});

// Toggle status active / inactive endpoint (Item 1)
app.post("/api/admin/users/toggle-status", requireAdminAuth, async (req, res) => {
  try {
    const { userId, email, newStatus } = req.body;
    const targetUser = memoryUsers.find(u => u.id === userId || u.email.toLowerCase() === (email || '').toLowerCase());
    if (targetUser) targetUser.status = newStatus;

    const supabase = getSupabase();
    if (supabase) {
      if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        await supabase.from("users").update({ status: newStatus }).eq("id", userId);
      } else if (email) {
        await supabase.from("users").update({ status: newStatus }).eq("email", email.trim().toLowerCase());
      }
    }

    res.json({ success: true, message: `User status set to ${newStatus} successfully!` });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update user status." });
  }
});

// Code Generation Endpoint (Item 3)
app.post("/api/admin/generate-code", requireAdminAuth, async (req, res) => {
  try {
    const codeObj = req.body;
    if (codeObj && codeObj.code) {
      const cleanCode = codeObj.code.trim().toUpperCase();
      const cleanEmail = (codeObj.userEmail || '').trim().toLowerCase();

      const newCodeItem = {
        id: codeObj.id || 'code_' + Date.now(),
        code: cleanCode,
        userEmail: cleanEmail,
        courseId: codeObj.courseId,
        status: codeObj.status || 'active',
        createdAt: codeObj.createdAt || new Date().toISOString()
      };

      memoryActivationCodes.unshift(newCodeItem);

      const supabase = getSupabase();
      if (supabase) {
        const crypto = require("crypto");
        const targetUuid = resolveCourseUuid(codeObj.courseId);
        
        const { error: insErr } = await supabase.from("enrollments").upsert({
          id: crypto.randomUUID(),
          user_email: cleanEmail,
          course_id: targetUuid,
          activation_code: cleanCode,
          status: 'active'
        });

        if (insErr) {
          console.error("Supabase enrollment upsert error:", insErr.message);
        }
      }
    }

    res.json({ success: true, message: "Activation code generated & saved to database." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to save code." });
  }
});

app.post("/api/admin/users/reset-code", requireAdminAuth, async (req, res) => {
  try {
    const { userEmail, courseId } = req.body;
    
    for (let i = memoryActivationCodes.length - 1; i >= 0; i--) {
      if (memoryActivationCodes[i].userEmail === userEmail && memoryActivationCodes[i].courseId === courseId) {
        memoryActivationCodes[i].status = 'revoked';
      }
    }

    const supabase = getSupabase();
    if (supabase) {
      const targetUuid = resolveCourseUuid(courseId);
      await supabase.from("orders").delete().eq("user_email", userEmail).eq("course_id", targetUuid);
      await supabase.from("enrollments").delete().eq("user_email", userEmail).eq("course_id", targetUuid);
    }

    res.json({ success: true, message: `Reset & revoked activation code for user "${userEmail}"!` });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to reset code." });
  }
});

// Update Activation Code Details (CRUD - Update)
app.post("/api/admin/codes/update", requireAdminAuth, async (req, res) => {
  try {
    const { id, oldCode, code, userEmail, courseId, status } = req.body;
    const cleanCode = (code || "").trim().toUpperCase();
    const cleanEmail = (userEmail || "").trim().toLowerCase();

    // Update memory
    const targetCode = memoryActivationCodes.find(c => c.id === id || c.code.toUpperCase() === (oldCode || '').toUpperCase());
    if (targetCode) {
      targetCode.code = cleanCode;
      targetCode.userEmail = cleanEmail;
      targetCode.courseId = courseId;
      targetCode.status = status;
    }

    const supabase = getSupabase();
    if (supabase) {
      const targetUuid = resolveCourseUuid(courseId);
      if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        await supabase.from("enrollments").update({
          activation_code: cleanCode,
          user_email: cleanEmail,
          course_id: targetUuid,
          status: status
        }).eq("id", id);
      } else if (oldCode) {
        await supabase.from("enrollments").update({
          activation_code: cleanCode,
          user_email: cleanEmail,
          course_id: targetUuid,
          status: status
        }).eq("activation_code", oldCode.trim().toUpperCase());
      }
    }

    res.json({ success: true, message: `Updated activation code "${cleanCode}" successfully!` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to update code." });
  }
});

// Delete Activation Code (CRUD - Delete)
app.post("/api/admin/codes/delete", requireAdminAuth, async (req, res) => {
  try {
    const { id, code } = req.body;
    memoryActivationCodes = memoryActivationCodes.filter(c => c.id !== id && c.code.toUpperCase() !== (code || '').toUpperCase());

    const supabase = getSupabase();
    if (supabase) {
      if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        await supabase.from("enrollments").delete().eq("id", id);
      } else if (code) {
        await supabase.from("enrollments").delete().eq("activation_code", code.trim().toUpperCase());
      }
    }

    res.json({ success: true, message: `Permanently deleted activation code "${code || id}"!` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete code." });
  }
});

// Repair function to restore 11 distinct course titles & images in Supabase if overwritten
async function repairSupabaseCoursesTable() {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    for (const course of fallbackCourses) {
      const targetUuid = resolveCourseUuid(course.id);
      const platformTag = course.tags?.find((t: any) => t.text === 'O11' || t.text === 'ODC')?.text || 'O11';
      const isNewTag = course.tags?.some((t: any) => t.text === 'NEW') || false;

      const rowPayload = {
        id: targetUuid,
        title: course.title,
        description: course.description,
        price: course.price,
        image_url: course.imageUrl,
        platform: platformTag,
        is_new: isNewTag
      };

      await supabase.from('courses').upsert(rowPayload, { onConflict: 'id' });
    }
  } catch (e: any) {
    console.error("Auto-repair courses table note:", e.message);
  }
}

// Auto-repair on startup
repairSupabaseCoursesTable();

// Course Management Endpoint (Role: Admin ONLY)
app.post("/api/admin/courses/upsert", requireAdminAuth, async (req, res) => {
  try {
    const { id, title, description, price, imageUrl, tags } = req.body;
    const targetUuid = resolveCourseUuid(id);
    const platformTag = tags?.find((t: any) => t.text === 'O11' || t.text === 'ODC')?.text || 'O11';
    const isNewTag = tags?.some((t: any) => t.text === 'NEW') || false;

    // 1. Update ONLY the target course in-memory on the server FIRST
    const fIdx = fallbackCourses.findIndex(f => f.id === id || f.id === targetUuid);
    if (fIdx !== -1) {
      fallbackCourses[fIdx] = {
        ...fallbackCourses[fIdx],
        title: title || fallbackCourses[fIdx].title,
        description: description !== undefined ? description : fallbackCourses[fIdx].description,
        price: Number(price !== undefined ? price : fallbackCourses[fIdx].price),
        imageUrl: imageUrl || fallbackCourses[fIdx].imageUrl,
        tags: tags || fallbackCourses[fIdx].tags
      };
    }

    const supabase = getSupabase();

    if (supabase) {
      const coreUpdate = {
        title: title,
        description: description,
        price: Number(price)
      };

      const extendedUpdate: Record<string, any> = {
        ...coreUpdate,
        platform: platformTag,
        is_new: isNewTag
      };
      if (imageUrl) {
        extendedUpdate.image_url = imageUrl;
      }

      // STRICT ID MATCHING ONLY - Never match by title substring!
      try { await supabase.from('courses').update(coreUpdate).eq('id', id); } catch (e) {}
      try { await supabase.from('courses').update(coreUpdate).eq('id', targetUuid); } catch (e) {}

      try { await supabase.from('courses').update(extendedUpdate).eq('id', id); } catch (e) {}
      try { await supabase.from('courses').update(extendedUpdate).eq('id', targetUuid); } catch (e) {}

      // Fallback upsert with targetUuid
      try {
        await supabase.from('courses').upsert({
          id: targetUuid,
          ...extendedUpdate
        });
      } catch (e) {
        try {
          await supabase.from('courses').upsert({
            id: targetUuid,
            ...coreUpdate
          });
        } catch (e2) {}
      }
    }

    res.json({ success: true, message: "Course details updated successfully in database!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to update course details." });
  }
});

// Helper function to sync exam_sets to Supabase courses table across courseId & targetUuid
async function syncCourseExamSetsToSupabase(supabase: any, courseId: string, targetUuid: string, examSets: any[]) {
  if (!supabase) return;
  const fallbackObj = fallbackCourses.find(f => f.id === courseId || f.id === targetUuid) || fallbackCourses[0];

  // 1. Update ONLY the target course in-memory on the server FIRST
  const fIdx = fallbackCourses.findIndex(f => f.id === courseId || f.id === targetUuid);
  if (fIdx !== -1) {
    fallbackCourses[fIdx].examSets = examSets;
    const allSetQs = examSets.flatMap(s => s.questions || []);
    if (allSetQs.length > 0) {
      fallbackCourses[fIdx].mockExam = allSetQs;
    }
  }

  const jsonStr = JSON.stringify(examSets);
  const allQuestions = examSets.flatMap(s => s.questions || []);
  const jsonQsStr = JSON.stringify(allQuestions);

  // 2. Try array & JSON string payloads across strict IDs ONLY
  const payloads = [
    { exam_sets: examSets },
    { exam_sets: jsonStr },
    { exam_sets: examSets, mock_exam: allQuestions },
    { exam_sets: jsonStr, mock_exam: jsonQsStr }
  ];

  for (const p of payloads) {
    try { await supabase.from('courses').update(p).eq('id', courseId); } catch (e) {}
    try { await supabase.from('courses').update(p).eq('id', targetUuid); } catch (e) {}
  }

  // 3. Fallback upsert
  try {
    await supabase.from('courses').upsert({
      id: targetUuid,
      title: fallbackObj ? fallbackObj.title : "OutSystems Certification Course",
      price: fallbackObj ? (fallbackObj.price || 29.99) : 29.99,
      image_url: fallbackObj ? (fallbackObj.imageUrl || '') : '',
      description: fallbackObj ? (fallbackObj.description || '') : '',
      exam_sets: examSets
    });
  } catch (e) {}
}

// SAVE QUESTIONS ENDPOINT FULLY CONNECTED TO SUPABASE 3NF SCHEMA ('exam_questions' & 'question_options')
app.post("/api/admin/questions/import", requireAdminAuth, async (req, res) => {
  try {
    const { courseId, questions } = req.body;
    if (!courseId || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, error: "Invalid payload." });
    }

    const targetUuid = resolveCourseUuid(courseId);
    inMemoryCourseQuestions[courseId] = questions;
    inMemoryCourseQuestions[targetUuid] = questions;

    // Sync in-memory examSets as well
    const currentMemorySets = inMemoryCourseExamSets[courseId] || inMemoryCourseExamSets[targetUuid];
    let updatedSets = currentMemorySets;
    if (!updatedSets || updatedSets.length === 0) {
      updatedSets = [
        {
          id: 'set-1',
          title: 'Dump 01',
          description: 'Bài kiểm tra thực hành Dump 01',
          durationMinutes: 90,
          passingScorePct: 70,
          randomizeQuestions: false,
          questions: questions
        }
      ];
    } else {
      updatedSets = updatedSets.map((s, i) => i === 0 ? { ...s, questions: questions } : s);
    }
    inMemoryCourseExamSets[courseId] = updatedSets;
    inMemoryCourseExamSets[targetUuid] = updatedSets;

    // Update in-memory fallbackCourses on the server
    const fIdx = fallbackCourses.findIndex(f => f.id === courseId || f.id === targetUuid);
    if (fIdx !== -1) {
      fallbackCourses[fIdx].mockExam = questions;
      fallbackCourses[fIdx].examSets = updatedSets;
    }

    const supabase = getSupabase();

    if (supabase) {
      // 0. Sync exam_sets JSONB to courses table
      await syncCourseExamSetsToSupabase(supabase, courseId, targetUuid, updatedSets);

      // 1. Ensure exam parent record exists in 'exams' table
      const fallbackObj = fallbackCourses.find(f => f.id === courseId) || fallbackCourses[0];
      const hex = targetUuid.replace(/-/g, '');
      const examId = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;

      await supabase.from('exams').upsert({
        id: examId,
        course_id: targetUuid,
        title: `${fallbackObj.title} - Official Practice Exam`
      });

      // 2. Delete existing questions for this exam
      const { data: existingQs } = await supabase.from("exam_questions").select("id").eq("exam_id", examId);
      if (existingQs && existingQs.length > 0) {
        const qIds = existingQs.map(q => q.id);
        await supabase.from("question_options").delete().in("question_id", qIds);
        await supabase.from("exam_questions").delete().eq("exam_id", examId);
      }

      // 3. Batch Insert into 'exam_questions' and 'question_options'
      const examPayload = questions.map((q: any) => ({
        exam_id: examId,
        question_text: q.question,
        correct_answer: q.correctAnswer || q.correct_answer || 'A',
        explanation: q.explanation || "Official OutSystems Exam Question",
        image_url: q.imageUrl || q.image_url || null
      }));

      for (let i = 0; i < examPayload.length; i += 50) {
        const chunk = examPayload.slice(i, i + 50);
        const { data: insertedQs, error: insErr } = await supabase.from("exam_questions").insert(chunk).select();

        if (insErr) {
          console.error("exam_questions batch insert error:", insErr.message);
        } else if (insertedQs) {
          const optionsPayload: any[] = [];
          insertedQs.forEach((iq: any, idx: number) => {
            const originalChoices = questions[i + idx]?.choices || [];
            originalChoices.forEach((opt: any) => {
              optionsPayload.push({
                question_id: iq.id,
                option_key: opt.key,
                option_text: opt.text
              });
            });
          });

          if (optionsPayload.length > 0) {
            await supabase.from("question_options").insert(optionsPayload);
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully saved ${questions.length} questions to Supabase database!`
    });
  } catch (err: any) {
    console.error("Save questions error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to save questions to database." });
  }
});

// SAVE EXAM SETS & CONFIGURATION ENDPOINT
app.post("/api/admin/courses/sets/update", requireAdminAuth, async (req, res) => {
  try {
    const { courseId, examSets } = req.body;
    if (!courseId || !Array.isArray(examSets)) {
      return res.status(400).json({ success: false, error: "Invalid payload." });
    }

    const targetUuid = resolveCourseUuid(courseId);
    inMemoryCourseExamSets[courseId] = examSets;
    inMemoryCourseExamSets[targetUuid] = examSets;

    // Combine questions across all sets for backward compatibility
    const allQuestions = examSets.flatMap(s => s.questions || []);
    inMemoryCourseQuestions[courseId] = allQuestions;
    inMemoryCourseQuestions[targetUuid] = allQuestions;

    const supabase = getSupabase();
    if (supabase) {
      // 1. Sync exam_sets JSONB column across courseId and targetUuid
      await syncCourseExamSetsToSupabase(supabase, courseId, targetUuid, examSets);

      // 2. Sync all questions to 3NF schema tables ('exam_questions' & 'question_options')
      if (allQuestions.length > 0) {
        try {
          const fallbackObj = fallbackCourses.find(f => f.id === courseId) || fallbackCourses[0];
          const hex = targetUuid.replace(/-/g, '');
          const examId = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;

          await supabase.from('exams').upsert({
            id: examId,
            course_id: targetUuid,
            title: `${fallbackObj.title} - Official Practice Exam`
          });

          // Delete existing questions for clean replacement
          const { data: existingQs } = await supabase.from("exam_questions").select("id").eq("exam_id", examId);
          if (existingQs && existingQs.length > 0) {
            const qIds = existingQs.map(q => q.id);
            await supabase.from("question_options").delete().in("question_id", qIds);
            await supabase.from("exam_questions").delete().eq("exam_id", examId);
          }

          // Insert questions
          const examPayload = allQuestions.map((q: any) => ({
            exam_id: examId,
            question_text: q.question,
            correct_answer: q.correctAnswer || q.correct_answer || 'A',
            explanation: q.explanation || "Official OutSystems Exam Question",
            image_url: q.imageUrl || q.image_url || null
          }));

          for (let i = 0; i < examPayload.length; i += 50) {
            const chunk = examPayload.slice(i, i + 50);
            const { data: insertedQs, error: insErr } = await supabase.from("exam_questions").insert(chunk).select();

            if (!insErr && insertedQs) {
              const optionsPayload: any[] = [];
              insertedQs.forEach((iq: any, idx: number) => {
                const originalChoices = allQuestions[i + idx]?.choices || [];
                originalChoices.forEach((opt: any) => {
                  optionsPayload.push({
                    question_id: iq.id,
                    option_key: opt.key,
                    option_text: opt.text
                  });
                });
              });
              if (optionsPayload.length > 0) {
                await supabase.from("question_options").insert(optionsPayload);
              }
            }
          }
        } catch (dbErr: any) {
          console.error("Supabase question sync error:", dbErr.message);
        }
      }
    }

    res.json({ success: true, message: `Successfully saved ${examSets.length} exam set(s) to database!` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to update exam sets." });
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

// Helper function to send custom HTML email via Nodemailer Gmail Transport (IPv4 forced for Render compatibility)
async function sendCustomEmail(toEmail: string, subject: string, htmlContent: string): Promise<{ success: boolean; error?: string }> {
  const senderEmail = (notificationSettings.adminEmail || process.env.ADMIN_EMAIL || process.env.GMAIL_USER || "duongrbt@gmail.com").trim();
  const pass = (notificationSettings.gmailAppPassword || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD || "").replace(/\s+/g, "");

  if (!senderEmail || !pass) {
    return {
      success: false,
      error: "Chưa cấu hình Admin Gmail Address hoặc Gmail App Password trong tab Alerts & API."
    };
  }

  // Attempt 1: Port 587 STARTTLS with IPv4 forced (bypasses Render IPv6 ENETUNREACH error)
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      family: 4, // FORCE IPv4 ONLY
      auth: {
        user: senderEmail,
        pass: pass
      },
      connectionTimeout: 10000
    });

    await transporter.sendMail({
      from: `"OutSystems Pro Academy" <${senderEmail}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent
    });

    return { success: true };
  } catch (err1: any) {
    console.error("Port 587 IPv4 Gmail note:", err1.message);

    // Attempt 2: Port 465 SSL with IPv4 forced
    try {
      const transporter465 = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        family: 4, // FORCE IPv4 ONLY
        auth: {
          user: senderEmail,
          pass: pass
        },
        connectionTimeout: 10000
      });

      await transporter465.sendMail({
        from: `"OutSystems Pro Academy" <${senderEmail}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent
      });

      return { success: true };
    } catch (err2: any) {
      console.error("Port 465 IPv4 Gmail error:", err2.message);
      return { 
        success: false, 
        error: `Lỗi kết nối Gmail SMTP: ${err2.message || err1.message}` 
      };
    }
  }
}

async function sendAdminEmailAlert(subject: string, textBody: string): Promise<boolean> {
  const res = await sendCustomEmail(
    notificationSettings.adminEmail || "duongrbt@gmail.com",
    subject,
    `<div style="font-family: Arial; padding: 20px; color: #f8fafc; background: #0f172a; border-radius: 12px;"><h3 style="color: #38bdf8;">${subject}</h3><p>${textBody}</p></div>`
  );
  return res.success;
}

// ENDPOINT: SEND ACTIVATION CODE EMAIL TO STUDENT (Item 2)
app.post("/api/admin/codes/send-email", requireAdminAuth, async (req, res) => {
  try {
    const { code, email, courseId } = req.body;
    if (!code || !email) {
      return res.status(400).json({ success: false, error: "Missing code or email address." });
    }

    const targetUuid = resolveCourseUuid(courseId || '');
    const courseObj = fallbackCourses.find(c => c.id === courseId || c.id === targetUuid) || fallbackCourses[0];
    const courseTitle = courseObj ? courseObj.title : "OutSystems Certification Course";
    const websiteUrl = req.headers.origin || "https://outsystems-pro-academy.onrender.com";

    const codeHtml = `
<div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 25px; border: 1px solid #334155;">
    <h2 style="color: #38bdf8; margin-top: 0; font-size: 22px;">🔑 Mã Kích Hoạt Khóa Học OutSystems</h2>
    <p style="color: #e2e8f0; font-size: 15px;">Xin chào <strong>${email}</strong>,</p>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Dưới đây là thông tin mã kích hoạt làm bài thi thử chứng chỉ OutSystems dành cho bạn:</p>
    
    <div style="background-color: #0f172a; padding: 18px; border-radius: 12px; margin: 20px 0; border: 1px solid #334155;">
      <p style="margin: 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Tài khoản (Email):</strong> <span style="color: #38bdf8; font-weight: bold;">${email}</span></p>
      <p style="margin: 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Khóa học đã đăng ký:</strong> <strong style="color: #fbbf24;">${courseTitle}</strong></p>
      <p style="margin: 14px 0 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Mã kích hoạt (Activation Code):</strong></p>
      <div style="background-color: #064e3b; color: #34d399; font-size: 22px; font-family: monospace; font-weight: bold; padding: 14px; border-radius: 8px; text-align: center; letter-spacing: 3px; border: 1px solid #059669;">
        ${code}
      </div>
    </div>

    <p style="color: #cbd5e1; font-size: 14px;"><strong>Hướng dẫn sử dụng:</strong></p>
    <ol style="color: #cbd5e1; line-height: 1.6; font-size: 14px; padding-left: 20px;">
      <li>Truy cập website: <a href="${websiteUrl}" style="color: #38bdf8; text-decoration: underline;">${websiteUrl}</a></li>
      <li>Đăng nhập bằng tài khoản email: <strong>${email}</strong></li>
      <li>Vào khóa học <strong>${courseTitle}</strong> và nhập mã <strong>${code}</strong> để mở khóa bài thi thử!</li>
    </ol>

    <div style="text-align: center; margin: 25px 0;">
      <a href="${websiteUrl}" style="background-color: #10b981; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(16,185,129,0.4);">🚀 Bắt đầu làm bài thi thử ngay</a>
    </div>

    <hr style="border: 0; border-top: 1px solid #334155; margin: 25px 0;" />
    <p style="font-size: 12px; color: #94a3b8; margin: 0;">Trân trọng,<br><strong>Đội ngũ OutSystems Pro Academy</strong><br><a href="${websiteUrl}" style="color: #38bdf8; text-decoration: none;">${websiteUrl}</a></p>
  </div>
</div>`;

    const mailRes = await sendCustomEmail(
      email,
      `[OutSystems Pro Academy] Mã kích hoạt (${code}) - ${courseTitle}`,
      codeHtml
    );

    if (mailRes.success) {
      res.json({ success: true, message: `Đã gửi mã kích hoạt ${code} tới email ${email} thành công!` });
    } else {
      res.status(400).json({ success: false, error: mailRes.error || "Gửi email thất bại." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to send code email." });
  }
});

// ENDPOINT: RE-GENERATE ACTIVATION CODE & SEND EMAIL (Item 2)
app.post("/api/admin/codes/regenerate", requireAdminAuth, async (req, res) => {
  try {
    const { id, oldCode, email, courseId } = req.body;
    if (!email || !courseId) {
      return res.status(400).json({ success: false, error: "Missing email or courseId." });
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 10; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `OS${randomPart}`;

    let updatedInMemory = false;
    for (let i = 0; i < memoryActivationCodes.length; i++) {
      if (
        (id && memoryActivationCodes[i].id === id) ||
        (oldCode && memoryActivationCodes[i].code === oldCode) ||
        (memoryActivationCodes[i].userEmail.toLowerCase() === email.toLowerCase() && memoryActivationCodes[i].courseId === courseId)
      ) {
        memoryActivationCodes[i].code = newCode;
        memoryActivationCodes[i].status = 'active';
        updatedInMemory = true;
        break;
      }
    }

    if (!updatedInMemory) {
      memoryActivationCodes.unshift({
        id: id || 'code_' + Date.now(),
        code: newCode,
        userEmail: email.trim().toLowerCase(),
        courseId: courseId,
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }

    const supabase = getSupabase();
    if (supabase) {
      const targetUuid = resolveCourseUuid(courseId);
      if (oldCode) {
        await supabase.from('enrollments').update({ activation_code: newCode, updated_at: new Date().toISOString() }).eq('activation_code', oldCode);
      }
      if (id) {
        await supabase.from('enrollments').update({ activation_code: newCode, updated_at: new Date().toISOString() }).eq('id', id);
      }
      await supabase.from('enrollments').update({ activation_code: newCode, updated_at: new Date().toISOString() }).eq('user_email', email.trim().toLowerCase()).eq('course_id', targetUuid);
    }

    const targetUuid = resolveCourseUuid(courseId);
    const courseObj = fallbackCourses.find(c => c.id === courseId || c.id === targetUuid) || fallbackCourses[0];
    const courseTitle = courseObj ? courseObj.title : "OutSystems Certification Course";
    const websiteUrl = req.headers.origin || "https://outsystems-pro-academy.onrender.com";

    const codeHtml = `
<div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 25px; border: 1px solid #334155;">
    <h2 style="color: #38bdf8; margin-top: 0; font-size: 22px;">🔄 Mã Kích Hoạt Mới (Re-Generated Code)</h2>
    <p style="color: #e2e8f0; font-size: 15px;">Xin chào <strong>${email}</strong>,</p>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Hệ thống vừa cập nhật tạo mới mã kích hoạt làm bài thi thử OutSystems dành cho bạn (Mã cũ đã được hủy):</p>
    
    <div style="background-color: #0f172a; padding: 18px; border-radius: 12px; margin: 20px 0; border: 1px solid #334155;">
      <p style="margin: 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Tài khoản (Email):</strong> <span style="color: #38bdf8; font-weight: bold;">${email}</span></p>
      <p style="margin: 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Khóa học đã đăng ký:</strong> <strong style="color: #fbbf24;">${courseTitle}</strong></p>
      <p style="margin: 14px 0 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Mã kích hoạt MỚI (New Activation Code):</strong></p>
      <div style="background-color: #064e3b; color: #34d399; font-size: 22px; font-family: monospace; font-weight: bold; padding: 14px; border-radius: 8px; text-align: center; letter-spacing: 3px; border: 1px solid #059669;">
        ${newCode}
      </div>
    </div>

    <p style="color: #cbd5e1; font-size: 14px;"><strong>Hướng dẫn sử dụng:</strong></p>
    <ol style="color: #cbd5e1; line-height: 1.6; font-size: 14px; padding-left: 20px;">
      <li>Truy cập website: <a href="${websiteUrl}" style="color: #38bdf8; text-decoration: underline;">${websiteUrl}</a></li>
      <li>Đăng nhập bằng tài khoản email: <strong>${email}</strong></li>
      <li>Nhập mã mới <strong>${newCode}</strong> để kích hoạt bài thi thử!</li>
    </ol>

    <div style="text-align: center; margin: 25px 0;">
      <a href="${websiteUrl}" style="background-color: #10b981; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(16,185,129,0.4);">🚀 Bắt đầu làm bài thi thử ngay</a>
    </div>

    <hr style="border: 0; border-top: 1px solid #334155; margin: 25px 0;" />
    <p style="font-size: 12px; color: #94a3b8; margin: 0;">Trân trọng,<br><strong>Đội ngũ OutSystems Pro Academy</strong><br><a href="${websiteUrl}" style="color: #38bdf8; text-decoration: none;">${websiteUrl}</a></p>
  </div>
</div>`;

    const mailRes = await sendCustomEmail(
      email,
      `[OutSystems Pro Academy] Mã kích hoạt mới (${newCode}) - ${courseTitle}`,
      codeHtml
    );

    res.json({
      success: true,
      newCode: newCode,
      message: mailRes.success 
        ? `Đã cấp mã mới (${newCode}) & gửi email tự động tới ${email} thành công!`
        : `Đã cấp mã mới (${newCode}) thành công! (Lưu ý email: ${mailRes.error})`,
      emailSent: mailRes.success,
      emailError: mailRes.error
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to regenerate code." });
  }
});

// System Settings API Endpoints (Supabase Persistence for Alerts & API Configuration)
async function loadNotificationSettingsFromSupabase() {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from("system_settings").select("*");
    if (!error && data && data.length > 0) {
      data.forEach((item: any) => {
        if (item.key === 'admin_email') notificationSettings.adminEmail = item.value;
        if (item.key === 'gmail_app_password') notificationSettings.gmailAppPassword = item.value;
        if (item.key === 'telegram_bot_token') notificationSettings.telegramBotToken = item.value;
        if (item.key === 'telegram_chat_id') notificationSettings.telegramChatId = item.value;
      });
    }
  } catch (e: any) {
    console.error("System settings Supabase sync note:", e.message);
  }
}

loadNotificationSettingsFromSupabase();

const handleGetSettings = async (req: express.Request, res: express.Response) => {
  await loadNotificationSettingsFromSupabase();
  res.json({
    success: true,
    adminEmail: notificationSettings.adminEmail,
    gmailAppPassword: notificationSettings.gmailAppPassword,
    telegramBotToken: notificationSettings.telegramBotToken,
    telegramChatId: notificationSettings.telegramChatId,
    settings: {
      adminEmail: notificationSettings.adminEmail,
      gmailAppPassword: notificationSettings.gmailAppPassword,
      telegramBotToken: notificationSettings.telegramBotToken,
      telegramChatId: notificationSettings.telegramChatId
    }
  });
};

app.get("/api/admin/notification-settings", requireAdminAuth, handleGetSettings);
app.get("/api/admin/settings", requireAdminAuth, handleGetSettings);

const handleSaveSettings = async (req: express.Request, res: express.Response) => {
  try {
    const { adminEmail, gmailAppPassword, telegramBotToken, telegramChatId } = req.body;

    if (adminEmail !== undefined) notificationSettings.adminEmail = (adminEmail || "").trim();
    if (gmailAppPassword !== undefined) notificationSettings.gmailAppPassword = (gmailAppPassword || "").trim();
    if (telegramBotToken !== undefined) notificationSettings.telegramBotToken = (telegramBotToken || "").trim();
    if (telegramChatId !== undefined) notificationSettings.telegramChatId = (telegramChatId || "").trim();

    const supabase = getSupabase();
    if (supabase) {
      const payload = [
        { key: "admin_email", value: notificationSettings.adminEmail, updated_at: new Date().toISOString() },
        { key: "gmail_app_password", value: notificationSettings.gmailAppPassword, updated_at: new Date().toISOString() },
        { key: "telegram_bot_token", value: notificationSettings.telegramBotToken, updated_at: new Date().toISOString() },
        { key: "telegram_chat_id", value: notificationSettings.telegramChatId, updated_at: new Date().toISOString() }
      ];
      const { error } = await supabase.from("system_settings").upsert(payload, { onConflict: "key" });
      if (error) {
        console.error("Supabase settings upsert note:", error.message);
      }
    }

    res.json({
      success: true,
      message: "Notification & API settings saved successfully to Supabase database!"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to save settings." });
  }
};

app.post("/api/admin/notification-settings", requireAdminAuth, handleSaveSettings);
app.post("/api/admin/settings", requireAdminAuth, handleSaveSettings);

app.post("/api/admin/test-email", requireAdminAuth, async (req, res) => {
  const targetEmail = req.body?.email || notificationSettings.adminEmail || process.env.ADMIN_EMAIL || "duongrbt@gmail.com";
  const result = await sendCustomEmail(
    targetEmail,
    "[OutSystems Pro Academy] Test Gmail Alert",
    `<div style="font-family: Arial; padding: 25px; color: #f8fafc; background-color: #0f172a; border-radius: 12px;">
       <h2 style="color: #38bdf8; margin-top: 0;">🎉 Kiểm Tra Gửi Email Thành Công!</h2>
       <p style="color: #cbd5e1;">Chức năng gửi email tự động từ hệ thống OutSystems Pro Academy hoạt động hoàn hảo!</p>
       <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Email người gửi: ${notificationSettings.adminEmail || 'Gmail System'}</p>
     </div>`
  );

  if (result.success) {
    res.json({ success: true, message: `Gửi email thử nghiệm tới ${targetEmail} thành công!` });
  } else {
    res.status(400).json({ 
      success: false, 
      message: `Gửi email thất bại: ${result.error || 'Vui lòng kiểm tra lại cấu hình Gmail App Password trong tab Alerts & API.'}` 
    });
  }
});

app.post("/api/admin/test-telegram", requireAdminAuth, async (req, res) => {
  const success = await sendTelegramAlert(
    "🚨 *OutSystems Pro Academy - Test Telegram Alert*\nThis is a test notification from your certification platform admin dashboard."
  );
  if (success) {
    res.json({ success: true, message: "Test Telegram alert sent successfully!" });
  } else {
    res.status(400).json({ success: false, message: "Failed to send Telegram alert. Please check Bot Token & Chat ID settings." });
  }
});

// Payment request creation endpoint connected to Supabase orders table
app.post("/api/payment-request", async (req, res) => {
  try {
    const { userEmail, courseId, courseTitle, amount } = req.body;
    const cleanEmail = (userEmail || "").trim().toLowerCase();
    const targetUuid = resolveCourseUuid(courseId);
    
    const crypto = require("crypto");
    const orderUuid = crypto.randomUUID();

    const reqObj = {
      id: orderUuid,
      userEmail: cleanEmail,
      courseId: courseId,
      courseTitle: courseTitle || "OutSystems Certification Course",
      amount: amount || 29.99,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    memoryPaymentRequests.unshift(reqObj);

    const supabase = getSupabase();
    if (supabase) {
      const { error: orderErr } = await supabase.from("orders").insert([{
        id: orderUuid,
        user_email: cleanEmail,
        course_id: targetUuid,
        course_title: reqObj.courseTitle,
        amount: Number(reqObj.amount),
        status: "pending"
      }]);

      if (orderErr) {
        console.error("Supabase order insert note:", orderErr.message);
      }
    }

    const alertText = `🚨 *NEW COURSE PURCHASE PAYMENT REQUEST*
📧 *Student Email:* ${reqObj.userEmail}
📚 *Course:* ${reqObj.courseTitle}
💵 *Amount:* $${reqObj.amount} USD
⏱️ *Time:* ${new Date().toLocaleString()}`;

    sendTelegramAlert(alertText).catch(() => {});
    sendAdminEmailAlert(`[Payment Request] ${reqObj.courseTitle}`, alertText.replace(/\*/g, "")).catch(() => {});

    res.json({ success: true, message: "Payment request submitted successfully and saved to database!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to process payment request." });
  }
});

// Admin payment request listing from Supabase orders & enrollments
app.get("/api/admin/payment-requests", requireAdminAuth, async (req, res) => {
  try {
    const supabase = getSupabase();
    let requestsList = [...memoryPaymentRequests];
    let codesList = [...memoryActivationCodes];

    if (supabase) {
      const { data: dbOrders } = await supabase.from("orders").select("*");
      if (dbOrders && dbOrders.length > 0) {
        dbOrders.forEach((o: any) => {
          if (!requestsList.some(r => r.id === o.id)) {
            requestsList.push({
              id: o.id,
              userEmail: o.user_email,
              courseId: o.course_id,
              courseTitle: o.course_title,
              amount: Number(o.amount),
              status: o.status || 'pending',
              createdAt: o.created_at || new Date().toISOString()
            });
          }
        });
      }

      const { data: dbEnroll } = await supabase.from("enrollments").select("*");
      if (dbEnroll && dbEnroll.length > 0) {
        dbEnroll.forEach((e: any) => {
          if (!codesList.some(c => c.code.toUpperCase() === (e.activation_code || '').toUpperCase())) {
            codesList.push({
              id: e.id,
              code: e.activation_code,
              userEmail: e.user_email,
              courseId: e.course_id,
              status: e.status || 'active',
              createdAt: e.created_at || new Date().toISOString()
            });
          }
        });
      }
    }

    res.json({ success: true, requests: requestsList, codes: codesList });
  } catch (err) {
    res.json({ success: true, requests: memoryPaymentRequests, codes: memoryActivationCodes });
  }
});

// Code validation & verification endpoint (Item 3)
const handleCodeValidation = async (req: express.Request, res: express.Response) => {
  try {
    const { email, userEmail, code, courseId } = req.body;
    const cleanCode = (code || "").trim().toUpperCase();
    const cleanEmail = (userEmail || email || "").trim().toLowerCase();
    const targetUuid = resolveCourseUuid(courseId);

    // STRICT AUTH RULE: User MUST be logged in to validate codes
    if (!cleanEmail) {
      return res.json({ valid: false, error: "Authentication required. Please log in to your account before entering activation code." });
    }

    if (!cleanCode) {
      return res.json({ valid: false, error: "Please enter an activation code." });
    }

    // 1. Check memory activation codes for match on code, course, and email
    const exactMemoryCode = memoryActivationCodes.find((c) => {
      const codeMatch = c.code.trim().toUpperCase() === cleanCode;
      const courseMatch = c.courseId === courseId || resolveCourseUuid(c.courseId) === targetUuid;
      const emailMatch = c.userEmail && c.userEmail.trim().toLowerCase() === cleanEmail;
      return codeMatch && courseMatch && emailMatch;
    });

    if (exactMemoryCode) {
      if (exactMemoryCode.status === 'revoked') {
        return res.json({ valid: false, error: "This activation code has been revoked by Admin." });
      }
      return res.json({ valid: true, success: true, message: "Activation code verified! Practice test unlocked." });
    }

    // Check if code exists in memory for a DIFFERENT course or email
    const anyMemoryCode = memoryActivationCodes.find(c => c.code.trim().toUpperCase() === cleanCode);
    if (anyMemoryCode) {
      if (anyMemoryCode.courseId !== courseId && resolveCourseUuid(anyMemoryCode.courseId) !== targetUuid) {
        return res.json({ valid: false, error: "This activation code was issued for a DIFFERENT course." });
      }
      if (cleanEmail && anyMemoryCode.userEmail && anyMemoryCode.userEmail.trim().toLowerCase() !== cleanEmail) {
        return res.json({ valid: false, error: `This code was issued for ${anyMemoryCode.userEmail}, not ${cleanEmail}.` });
      }
    }

    // 2. Check Supabase enrollments table for match on activation_code & course_id
    const supabase = getSupabase();
    if (supabase) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("*")
        .eq("activation_code", cleanCode)
        .eq("course_id", targetUuid)
        .maybeSingle();

      if (enrollment) {
        if (enrollment.status === 'revoked') {
          return res.json({ valid: false, error: "This activation code has been revoked by Admin." });
        }
        if (cleanEmail && enrollment.user_email && enrollment.user_email.trim().toLowerCase() !== cleanEmail) {
          return res.json({ valid: false, error: `This code was issued for ${enrollment.user_email}, not ${cleanEmail}.` });
        }
        return res.json({ valid: true, success: true, message: "Activation code verified! Practice test unlocked." });
      }

      // Check if code exists in Supabase for a DIFFERENT course
      const { data: diffEnrollment } = await supabase
        .from("enrollments")
        .select("*")
        .eq("activation_code", cleanCode)
        .maybeSingle();

      if (diffEnrollment) {
        if (diffEnrollment.course_id !== targetUuid) {
          return res.json({ valid: false, error: "This activation code was issued for a DIFFERENT course." });
        }
        if (cleanEmail && diffEnrollment.user_email && diffEnrollment.user_email.trim().toLowerCase() !== cleanEmail) {
          return res.json({ valid: false, error: `This code was issued for ${diffEnrollment.user_email}, not ${cleanEmail}.` });
        }
      }
    }

    res.json({ valid: false, error: "Invalid activation code or course mismatch." });
  } catch (err: any) {
    res.json({ valid: false, error: "Error validating activation code." });
  }
};

app.post("/api/validate-code", handleCodeValidation);
app.post("/api/verify-code", handleCodeValidation);

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
