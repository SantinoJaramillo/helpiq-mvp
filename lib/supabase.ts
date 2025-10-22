import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase service client. Use only inside API routes / server code.
 * Ensure SUPABASE_SERVICE_ROLE_KEY is set in Render and NOT exposed to the browser.
 */
export const supabaseService = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);