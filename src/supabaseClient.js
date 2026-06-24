import { createClient } from "@supabase/supabase-js";

const url = "https://ucdpnpqvjxtbccwiqzmb.supabase.co";
const key = "sb_publishable_-5bkYBEiYj33OCikG5SQGw_Hz1MWrCX";

export const supabase = createClient(url, key);
