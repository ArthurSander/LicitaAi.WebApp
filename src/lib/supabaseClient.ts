import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast in dev so it's obvious what's missing.
  // (Vite injects env vars at build time; keep this as a runtime check.)
  // eslint-disable-next-line no-console
  console.warn(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env",
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
