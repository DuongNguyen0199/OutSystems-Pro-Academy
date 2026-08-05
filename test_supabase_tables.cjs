require('dotenv').config();

async function testExamQuestionsInsert() {
  const nodeFetch = await import('node-fetch');
  globalThis.fetch = nodeFetch.default;
  globalThis.Headers = nodeFetch.Headers;

  try {
    const ws = require('ws');
    if (!globalThis.WebSocket) globalThis.WebSocket = ws;
  } catch (e) {}

  const { createClient } = require('@supabase/supabase-js');

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false }
  });

  const targetUuid = '70daa8a9-20c7-4993-b292-54566ef12303';
  const hex = targetUuid.replace(/-/g, '');
  const examId = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;

  console.log("--- 1. Upserting exam in 'exams' table ---");
  const { error: eExam } = await supabase.from('exams').upsert({
    id: examId,
    course_id: targetUuid,
    title: 'OutSystems Associate Reactive Developer (O11) - Official Dump Practice Exam'
  });
  console.log("Exams upsert error:", eExam);

  console.log("\n--- 2. Inserting question into 'exam_questions' table ---");
  const testPayload = [{
    exam_id: examId,
    question_text: "What is an important decision for a delivery specialist?",
    correct_answer: "A",
    explanation: "Official OutSystems Explanation"
  }];

  const { data: insData, error: insErr } = await supabase.from('exam_questions').insert(testPayload).select();
  console.log("exam_questions insert result:", { inserted: insData, error: insErr });

  if (insData && insData.length > 0) {
    const questionId = insData[0].id;
    console.log("\n--- 3. Inserting choices into 'question_options' table ---");
    const optionsPayload = [
      { question_id: questionId, option_key: "A", option_text: "Choice A" },
      { question_id: questionId, option_key: "B", option_text: "Choice B" }
    ];
    const { data: optData, error: optErr } = await supabase.from('question_options').insert(optionsPayload).select();
    console.log("question_options insert result:", { inserted: optData, error: optErr });
  }
}

testExamQuestionsInsert();
