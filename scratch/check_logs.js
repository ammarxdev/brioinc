const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Custom env parser
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Connecting to Supabase at:", supabaseUrl);
  console.log("Fetching recent email logs...");
  const { data: logs, error } = await supabase
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(15);

  if (error) {
    console.error("Error fetching email_logs:", error);
  } else {
    console.log("Email logs (last 15):", JSON.stringify(logs, null, 2));
  }

  console.log("\nFetching recent users to see registration state...");
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (userError) {
    console.error("Error fetching users:", userError);
  } else {
    console.log("Users (last 5):", JSON.stringify(users, null, 2));
  }
}

check();
