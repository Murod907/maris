import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Supabase sozlamalari topilmadi. .env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY ni to'g'ri kiritganingizga ishonch hosil qiling."
  );
}

export const supabase = createClient(url, key);
