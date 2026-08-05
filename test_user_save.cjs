require('dotenv').config();

async function testUserSave() {
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

  console.log("\n--- Testing user upsert with valid UUID and exact 5 columns ---");
  const crypto = require('crypto');
  const userUuid = crypto.randomUUID();

  const newUserPayload = {
    id: userUuid,
    email: "teststudent" + Date.now() + "@gmail.com",
    role: "student",
    status: "active"
  };

  const { data: insData, error: insErr } = await supabase.from('users').upsert(newUserPayload).select();
  console.log("User Upsert Result:", { inserted: insData, error: insErr });
}

testUserSave();
