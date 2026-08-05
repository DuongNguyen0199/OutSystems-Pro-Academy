const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log("URL:", url);
console.log("Key present:", !!anonKey);

const supabase = createClient(url, anonKey);

const COURSE_ID_TO_UUID = {
  'course_assoc_reactive_o11': '70daa8a9-20c7-4993-b292-54566ef12303',
  'course_arch_odc': '56c652a7-7d07-41ea-bfe7-c19acd320420',
  'course_agentic_ai_odc': '48ad6d82-3994-490a-a4f4-c07f0a7a38db'
};

async function testSave() {
  console.log("\n--- 1. Testing 'mock_exam_questions' table insert with valid UUID ---");
  const targetUuid = COURSE_ID_TO_UUID['course_assoc_reactive_o11'];
  
  const testQ = {
    course_id: targetUuid,
    question: "Test question save from Node with valid UUID",
    choices: [{ key: "A", text: "Test A" }, { key: "B", text: "Test B" }],
    correct_answer: "A",
    explanation: "Test Explanation"
  };

  const { data: d1, error: e1 } = await supabase.from("mock_exam_questions").insert([testQ]).select();
  console.log("mock_exam_questions insert result:", { data: d1, error: e1 });

  console.log("\n--- 2. Testing 9-table schema 'exam_questions' table ---");
  const hex = targetUuid.replace(/-/g, '');
  const examId = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;

  const testEq = {
    exam_id: examId,
    question_text: "Test question text 9-table with valid UUID",
    correct_answer: "A",
    explanation: "Test explanation"
  };

  const { data: d2, error: e2 } = await supabase.from("exam_questions").insert([testEq]).select();
  console.log("exam_questions insert result:", { data: d2, error: e2 });
}

testSave();
