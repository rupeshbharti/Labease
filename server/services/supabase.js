import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'Missing backend Supabase environment variables. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  );
}

// Bypasses RLS to allow backend-only CRUD actions
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabaseAdmin;
