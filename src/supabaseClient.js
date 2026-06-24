import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
   " https://ucdpnpqvjxtbccwiqzmb.supabase.co, sb_publishable_-5bkYBEiYj33OCikG5SQGw_Hz1MWrCX "
  );
}

export const supabase = createClient(supabseUrl, supabaseAnonKey);
