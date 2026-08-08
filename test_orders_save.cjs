require('dotenv').config();

async function testOrdersSave() {
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

  console.log("\n--- Testing order insert with course_title ---");
  const crypto = require('crypto');
  const targetUuid = '70daa8a9-20c7-4993-b292-54566ef12303';
  const testPayload = {
    id: crypto.randomUUID(),
    user_email: "student_test" + Date.now() + "@gmail.com",
    course_id: targetUuid,
    course_title: "OutSystems Associate Reactive Developer (O11)",
    amount: 29.99,
    status: 'pending'
  };

  const { data: insData, error: insErr } = await supabase.from('orders').insert([testPayload]).select();
  console.log("Order Insert Result:", { inserted: insData, error: insErr });
}

testOrdersSave();
