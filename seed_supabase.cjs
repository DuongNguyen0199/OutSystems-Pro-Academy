const { createClient } = require('@supabase/supabase-js');
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

const supabase = createClient(supabaseUrl, supabaseKey);
const rootDir = 'C:\\Users\\nguye\\Desktop\\Udemy\\Outsystems Experiences';

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

  const questions = [];

  for (let l = 1; l < lines.length; l++) {
    const line = lines[l];
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

    if (cells.length < 3) continue;

    const questionText = cells[0];
    if (!questionText || questionText.toLowerCase().includes('question')) continue;

    const choices = [];
    if (cells[2]) choices.push({ key: 'A', text: cells[2] });
    if (cells[4]) choices.push({ key: 'B', text: cells[4] });
    if (cells[6]) choices.push({ key: 'C', text: cells[6] });
    if (cells[8]) choices.push({ key: 'D', text: cells[8] });

    let correctKey = 'A';
    if (cells[14]) {
      const num = parseInt(cells[14], 10);
      if (num === 1) correctKey = 'A';
      else if (num === 2) correctKey = 'B';
      else if (num === 3) correctKey = 'C';
      else if (num === 4) correctKey = 'D';
      else if (['A', 'B', 'C', 'D'].includes(cells[14].toUpperCase())) correctKey = cells[14].toUpperCase();
    }

    const explanation = cells[15] || cells[3] || cells[5] || 'Official OutSystems Exam Question';

    if (questionText && choices.length >= 2) {
      questions.push({
        question: questionText,
        choices: choices,
        correct_answer: correctKey,
        explanation: explanation
      });
    }
  }

  return questions;
}

const coursesData = [
  { id: '70daa8a9-20c7-4993-b292-54566ef12303', title: 'OutSystems Associate Reactive Developer (O11)', price: 29.99, platform: 'O11', is_new: false, folder: 'Reactive', image_url: '/src/assets/images/web_developer_1783426831823.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Associate Reactive Developer (O11).' },
  { id: '56c652a7-7d07-41ea-bfe7-c19acd320420', title: 'OutSystems Architecture Specialist (ODC)', price: 34.99, platform: 'ODC', is_new: false, folder: 'Architecture ODC', image_url: '/src/assets/images/architecture_specialist_1783426813087.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Architecture Specialist (ODC).' },
  { id: '48ad6d82-3994-490a-a4f4-c07f0a7a38db', title: 'OutSystems Agentic AI Specialist (ODC)', price: 39.99, platform: 'ODC', is_new: true, folder: 'AI Agentic', image_url: '/src/assets/images/agentic_ai_1783426796399.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Agentic AI Specialist (ODC).' },
  { id: '2867b931-1550-424a-939e-99083bc56c12', title: 'OutSystems Architecture Specialist (O11)', price: 34.99, platform: 'O11', is_new: false, folder: 'Architecture O11', image_url: '/src/assets/images/architecture_specialist_1783426813087.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Architecture Specialist (O11).' },
  { id: 'a57fa873-1082-4ef9-81fb-8b173bf23901', title: 'OutSystems Security Specialist (O11)', price: 34.99, platform: 'O11', is_new: false, folder: 'Security', image_url: '/src/assets/images/agentic_ai_1783426796399.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Security Specialist (O11).' },
  { id: '91bc8604-58a2-4a0b-bf11-48229a103211', title: 'OutSystems Tech Lead Specialist (O11)', price: 39.99, platform: 'O11', is_new: false, folder: 'Techlead', image_url: '/src/assets/images/architecture_specialist_1783426813087.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Tech Lead Specialist (O11).' },
  { id: 'fe771120-410a-4859-994c-120019283401', title: 'OutSystems Mobile Developer Specialist (O11)', price: 29.99, platform: 'O11', is_new: false, folder: 'Mobile', image_url: '/src/assets/images/web_developer_1783426831823.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Mobile Developer Specialist (O11).' },
  { id: 'c9019208-1192-421b-8711-540192837101', title: 'OutSystems Web Developer Specialist (O11)', price: 29.99, platform: 'O11', is_new: false, folder: 'Web Specialist', image_url: '/src/assets/images/web_developer_1783426831823.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Web Developer Specialist (O11).' },
  { id: '89102931-1029-4102-8812-109283019201', title: 'OutSystems Front-End Developer Specialist (O11)', price: 29.99, platform: 'O11', is_new: false, folder: 'Front-End', image_url: '/src/assets/images/web_developer_1783426831823.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Front-End Developer Specialist (O11).' },
  { id: 'e1029381-1920-4819-9182-109283019201', title: 'OutSystems Delivery Specialist (O11)', price: 29.99, platform: 'O11', is_new: false, folder: 'Delivery', image_url: '/src/assets/images/agentic_ai_1783426796399.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Delivery Specialist (O11).' },
  { id: 'd0192831-1092-4192-8812-109283019201', title: 'OutSystems Platform Ops Specialist (O11)', price: 34.99, platform: 'O11', is_new: false, folder: 'Platform Ops', image_url: '/src/assets/images/architecture_specialist_1783426813087.jpg', description: 'Complete verified practice tests and exam dump questions for OutSystems Platform Ops Specialist (O11).' }
];

async function seedSupabase() {
  console.log(`📡 Connecting to Supabase at: ${supabaseUrl}`);

  // 1. Upsert Courses
  for (const c of coursesData) {
    const { error } = await supabase.from('courses').upsert({
      id: c.id,
      title: c.title,
      price: c.price,
      platform: c.platform,
      is_new: c.is_new,
      image_url: c.image_url,
      description: c.description
    });

    if (error) {
      console.error(`Error inserting course ${c.title}:`, error.message);
    } else {
      console.log(`✅ Course synced to Supabase: ${c.title}`);
    }
  }

  // 2. Read Dump Questions & Insert into mock_exam_questions
  let totalInsertedQuestions = 0;

  for (const c of coursesData) {
    const dirPath = path.join(rootDir, c.folder);
    let courseQuestions = [];

    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        if (file.toLowerCase().endsWith('.csv')) {
          const fullPath = path.join(dirPath, file);
          const parsed = parseCsvFile(fullPath);
          courseQuestions = courseQuestions.concat(parsed);
        }
      });

      const sourceDir = path.join(dirPath, 'Source');
      if (fs.existsSync(sourceDir)) {
        const sourceFiles = fs.readdirSync(sourceDir);
        sourceFiles.forEach(file => {
          if (file.toLowerCase().endsWith('.csv')) {
            const fullPath = path.join(sourceDir, file);
            const parsed = parseCsvFile(fullPath);
            courseQuestions = courseQuestions.concat(parsed);
          }
        });
      }
    }

    if (courseQuestions.length > 0) {
      const payload = courseQuestions.map(q => ({
        course_id: c.id,
        question: q.question,
        choices: q.choices,
        correct_answer: q.correct_answer,
        explanation: q.explanation
      }));

      // Batch insert 50 questions at a time
      for (let i = 0; i < payload.length; i += 50) {
        const chunk = payload.slice(i, i + 50);
        const { error } = await supabase.from('mock_exam_questions').insert(chunk);
        if (error) {
          console.error(`Error inserting questions for ${c.title}:`, error.message);
        } else {
          totalInsertedQuestions += chunk.length;
        }
      }
      console.log(`  -> Inserted ${courseQuestions.length} dump questions for ${c.title}`);
    }
  }

  console.log(`\n🎉 SUPABASE SEEDING COMPLETED! Total questions inserted: ${totalInsertedQuestions}`);
}

seedSupabase().catch(err => console.error("Migration error:", err));
