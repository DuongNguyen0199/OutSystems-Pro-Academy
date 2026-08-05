const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL and SUPABASE_ANON_KEY must be configured in environment variables or .env file!");
  console.log("Example:");
  console.log("SUPABASE_URL=https://xxxx.supabase.co");
  console.log("SUPABASE_ANON_KEY=eyJhbGciOi...");
  process.exit(1);
}

const rootDir = 'C:\\Users\\nguye\\Desktop\\Udemy\\Outsystems Experiences';

function getAllCsvFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllCsvFilesRecursively(filePath));
    } else if (file.toLowerCase().endsWith('.csv')) {
      results.push(filePath);
    }
  });
  return results;
}

function parseCsvFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  
  const lines = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length < 2) return [];

  const parseLineCells = (line) => {
    const cells = [];
    let cell = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        insideQuotes = !insideQuotes;
      } else if (c === ',' && !insideQuotes) {
        cells.push(cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        cell = '';
      } else {
        cell += c;
      }
    }
    cells.push(cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    return cells;
  };

  const headerCells = parseLineCells(lines[0]).map(h => h.toLowerCase());
  const questions = [];

  for (let l = 1; l < lines.length; l++) {
    const cells = parseLineCells(lines[l]);
    if (cells.length < 2) continue;

    let questionText = cells[0];
    if (!questionText || questionText.toLowerCase() === 'question') continue;

    let choices = [];
    let correctKey = 'A';
    let explanation = 'Official OutSystems Exam Question';

    const opt1Idx = headerCells.findIndex(h => h.includes('answer option 1') || h === 'choice a' || h === 'option a');
    const opt2Idx = headerCells.findIndex(h => h.includes('answer option 2') || h === 'choice b' || h === 'option b');
    const opt3Idx = headerCells.findIndex(h => h.includes('answer option 3') || h === 'choice c' || h === 'option c');
    const opt4Idx = headerCells.findIndex(h => h.includes('answer option 4') || h === 'choice d' || h === 'option d');
    const correctIdx = headerCells.findIndex(h => h.includes('correct answer') || h.includes('correctanswers') || h.includes('correct'));
    const expIdx = headerCells.findIndex(h => h.includes('overall explanation') || h.includes('explanation'));

    if (opt1Idx !== -1 && opt2Idx !== -1) {
      if (cells[opt1Idx]) choices.push({ key: 'A', text: cells[opt1Idx] });
      if (cells[opt2Idx]) choices.push({ key: 'B', text: cells[opt2Idx] });
      if (opt3Idx !== -1 && cells[opt3Idx]) choices.push({ key: 'C', text: cells[opt3Idx] });
      if (opt4Idx !== -1 && cells[opt4Idx]) choices.push({ key: 'D', text: cells[opt4Idx] });

      if (correctIdx !== -1 && cells[correctIdx]) {
        const rawAns = cells[correctIdx].trim();
        const num = parseInt(rawAns, 10);
        if (num === 1) correctKey = 'A';
        else if (num === 2) correctKey = 'B';
        else if (num === 3) correctKey = 'C';
        else if (num === 4) correctKey = 'D';
        else if (['A', 'B', 'C', 'D'].includes(rawAns.toUpperCase())) correctKey = rawAns.toUpperCase();
      }

      if (expIdx !== -1 && cells[expIdx]) {
        explanation = cells[expIdx];
      }
    } else {
      if (cells[2]) choices.push({ key: 'A', text: cells[2] });
      if (cells[4]) choices.push({ key: 'B', text: cells[4] });
      if (cells[6]) choices.push({ key: 'C', text: cells[6] });
      if (cells[8]) choices.push({ key: 'D', text: cells[8] });

      if (cells[14]) {
        const num = parseInt(cells[14], 10);
        if (num === 1) correctKey = 'A';
        else if (num === 2) correctKey = 'B';
        else if (num === 3) correctKey = 'C';
        else if (num === 4) correctKey = 'D';
        else if (['A', 'B', 'C', 'D'].includes(cells[14].toUpperCase())) correctKey = cells[14].toUpperCase();
      }

      explanation = cells[15] || cells[3] || cells[5] || explanation;
    }

    if (questionText && choices.length >= 2) {
      questions.push({
        question_text: questionText,
        choices: choices,
        correct_answer: correctKey,
        explanation: explanation
      });
    }
  }

  return questions;
}

const coursesData = [
  { id: '70daa8a9-20c7-4993-b292-54566ef12303', title: 'OutSystems Associate Reactive Developer (O11)', price: 29.99, platform: 'O11', is_new: false, folder: 'Reactive', image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 102 exam dump questions for OutSystems Associate Reactive Developer (O11).' },
  { id: '56c652a7-7d07-41ea-bfe7-c19acd320420', title: 'OutSystems Architecture Specialist (ODC)', price: 34.99, platform: 'ODC', is_new: false, folder: 'Architecture ODC', image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 50 exam dump questions for OutSystems Architecture Specialist (ODC).' },
  { id: '48ad6d82-3994-490a-a4f4-c07f0a7a38db', title: 'OutSystems Agentic AI Specialist (ODC)', price: 39.99, platform: 'ODC', is_new: true, folder: 'AI Agentic', image_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 40 exam dump questions for OutSystems Agentic AI Specialist (ODC).' },
  { id: '2867b931-1550-424a-939e-99083bc56c12', title: 'OutSystems Architecture Specialist (O11)', price: 34.99, platform: 'O11', is_new: false, folder: 'Architecture O11', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 55 exam dump questions for OutSystems Architecture Specialist (O11).' },
  { id: 'a57fa873-1082-4ef9-81fb-8b173bf23901', title: 'OutSystems Security Specialist (O11)', price: 34.99, platform: 'O11', is_new: false, folder: 'Security', image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 120 exam dump questions for OutSystems Security Specialist (O11).' },
  { id: '91bc8604-58a2-4a0b-bf11-48229a103211', title: 'OutSystems Tech Lead Specialist (O11)', price: 39.99, platform: 'O11', is_new: false, folder: 'Techlead', image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 180 exam dump questions for OutSystems Tech Lead Specialist (O11).' },
  { id: 'fe771120-410a-4859-994c-120019283401', title: 'OutSystems Mobile Developer Specialist (O11)', price: 29.99, platform: 'O11', is_new: false, folder: 'Mobile', image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 85 exam dump questions for OutSystems Mobile Developer Specialist (O11).' },
  { id: 'c9019208-1192-421b-8711-540192837101', title: 'OutSystems Web Developer Specialist (O11)', price: 29.99, platform: 'O11', is_new: false, folder: 'Web Specialist', image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 90 exam dump questions for OutSystems Web Developer Specialist (O11).' },
  { id: '89102931-1029-4102-8812-109283019201', title: 'OutSystems Front-End Developer Specialist (O11)', price: 29.99, platform: 'O11', is_new: false, folder: 'Front-End', image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 60 exam dump questions for OutSystems Front-End Developer Specialist (O11).' },
  { id: 'e1029381-1920-4819-9182-109283019201', title: 'OutSystems Delivery Specialist (O11)', price: 29.99, platform: 'O11', is_new: false, folder: 'Delivery', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 165 exam dump questions for OutSystems Delivery Specialist (O11).' },
  { id: 'd0192831-1092-4192-8812-109283019201', title: 'OutSystems Platform Ops Specialist (O11)', price: 34.99, platform: 'O11', is_new: false, folder: 'Platform Ops', image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80', description: 'Complete verified practice tests and 232 exam dump questions for OutSystems Platform Ops Specialist (O11).' }
];

async function seedSupabase() {
  if (typeof globalThis.fetch === 'undefined') {
    const nodeFetch = await import('node-fetch');
    globalThis.fetch = nodeFetch.default || nodeFetch;
    if (typeof globalThis.Headers === 'undefined') {
      globalThis.Headers = nodeFetch.Headers;
    }
  }

  if (typeof globalThis.WebSocket === 'undefined') {
    class DummyWebSocket {
      constructor() {}
      on() {}
      close() {}
      addEventListener() {}
      removeEventListener() {}
    }
    globalThis.WebSocket = DummyWebSocket;
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: null }
  });

  console.log(`📡 Connecting to Supabase at: ${supabaseUrl}`);

  // 1. Upsert Admin User into 'users'
  const { data: adminUser, error: userError } = await supabase.from('users').upsert({
    email: 'duongrbt@gmail.com',
    role: 'admin',
    status: 'active'
  }, { onConflict: 'email' }).select().single();

  if (userError) {
    console.error("User upsert note:", userError.message);
  } else {
    console.log("✅ Admin user seeded into 'users' table");
  }

  // 2. Upsert Courses & Exams
  for (const c of coursesData) {
    const { error: courseErr } = await supabase.from('courses').upsert({
      id: c.id,
      title: c.title,
      price: c.price,
      platform: c.platform,
      is_new: c.is_new,
      image_url: c.image_url,
      description: c.description
    });

    if (courseErr) {
      console.error(`Error inserting course ${c.title}:`, courseErr.message);
      continue;
    }

    console.log(`✅ Course synced: ${c.title}`);

    const hex = c.id.replace(/-/g, '');
    const examId = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;
    const { error: examErr } = await supabase.from('exams').upsert({
      id: examId,
      course_id: c.id,
      title: `${c.title} - Official Dump Practice Exam`,
      time_limit_minutes: 75,
      passing_score_percentage: 70
    });

    if (examErr) {
      console.error(`  Exam note:`, examErr.message);
    }
  }

  // 3. Read Dump Questions Recursively & Insert into exam_questions & mock_exam_questions
  let totalQuestions = 0;

  for (const c of coursesData) {
    const hex = c.id.replace(/-/g, '');
    const examId = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;
    const dirPath = path.join(rootDir, c.folder);
    let courseQuestions = [];

    const allCsvFiles = getAllCsvFilesRecursively(dirPath);
    allCsvFiles.forEach(file => {
      const parsed = parseCsvFile(file);
      courseQuestions = courseQuestions.concat(parsed);
    });

    if (courseQuestions.length > 0) {
      const mockPayload = courseQuestions.map(q => ({
        course_id: c.id,
        question: q.question_text,
        choices: q.choices,
        correct_answer: q.correct_answer,
        explanation: q.explanation
      }));

      for (let i = 0; i < mockPayload.length; i += 50) {
        const chunk = mockPayload.slice(i, i + 50);
        await supabase.from('mock_exam_questions').insert(chunk);
      }

      const examPayload = courseQuestions.map(q => ({
        exam_id: examId,
        question_text: q.question_text,
        correct_answer: q.correct_answer,
        explanation: q.explanation
      }));

      for (let i = 0; i < examPayload.length; i += 50) {
        const chunk = examPayload.slice(i, i + 50);
        const { data: insertedQs, error: qErr } = await supabase.from('exam_questions').insert(chunk).select();
        
        if (!qErr && insertedQs) {
          totalQuestions += insertedQs.length;

          const optionsPayload = [];
          insertedQs.forEach((iq, idx) => {
            const originalChoices = courseQuestions[i + idx]?.choices || [];
            originalChoices.forEach(opt => {
              optionsPayload.push({
                question_id: iq.id,
                option_key: opt.key,
                option_text: opt.text
              });
            });
          });

          if (optionsPayload.length > 0) {
            await supabase.from('question_options').insert(optionsPayload);
          }
        }
      }

      console.log(`  -> Synced ${courseQuestions.length} dump questions (from ${allCsvFiles.length} CSV files) for ${c.title}`);
    }
  }

  console.log(`\n🎉 SUPABASE 9-TABLE SEEDING COMPLETED! Total questions synced: ${totalQuestions}`);
}

seedSupabase().catch(err => console.error("Migration error:", err));
