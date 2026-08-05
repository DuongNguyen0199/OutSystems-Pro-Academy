require('dotenv').config();

async function testEnrollmentSave() {
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

  console.log("\n--- 1. Checking 'enrollments' table structure ---");
  const { data: enrollments, error: errEnroll } = await supabase.from('enrollments').select('*').limit(3);
  console.log("Enrollments query:", { enrollments, error: errEnroll });

  console.log("\n--- 2. Testing enrollment upsert ---");
  const targetUuid = '70daa8a9-20c7-4993-b292-54566ef12303';
  const testPayload = {
    user_email: "duongrbt1@gmail.com",
    course_id: targetUuid,
    activation_code: "OUT-ODC-90D-SNT4D",
    status: 'active'
  };

  const { data: insData, error: insErr } = await supabase.from('enrollments').upsert(testPayload).select();
  console.log("Enrollment Upsert Result:", { inserted: insData, error: insErr });
}

testEnrollmentSave();
