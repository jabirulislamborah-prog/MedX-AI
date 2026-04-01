import fs from 'fs';
import { createServerClient } from '@supabase/ssr';
import dotenv from 'dotenv';
import { FormData, File } from 'formdata-node';

dotenv.config();

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pqqyqjxhgqckuujngqyy.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return;
  }
  const supabase = createServerClient(
    supabaseUrl,
    anonKey,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'jabir.islam@gau.edu.ge',
    password: '@Ssam123'
  });
  
  if (authError || !authData.session) {
    console.error("Login failed:", authError);
    return;
  }
  
  const token = authData.session.access_token;
  
  const fd = new FormData();
  fd.append('subject', 'Test Content');
  const textContent = "Aspirin is a salicylate drug, often used as an analgesic to relieve minor aches and pains, as an antipyretic to reduce fever, and as an anti-inflammatory medication.";
  fd.append('file', new File([textContent], 'test_aspirin.txt', { type: 'text/plain'}));

  console.log("Sending req to Vercel production...");
  const res = await fetch('https://med-x-ai-eight.vercel.app/api/documents/process', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: fd
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
run();
