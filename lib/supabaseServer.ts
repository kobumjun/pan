import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getSupabaseServerAnon() {
  return createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
}

export function getSupabaseServerService() {
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

