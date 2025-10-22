/**
 * Två klienter:
 * - supabaseAnon: Används på klientsidan (webbläsaren) med ANON-nyckeln
 * - supabaseService: Används på serversidan med Service Role (starkare rättigheter (Auth))
 * OBS! Lägg aldrig in service key i klientkod. 
 */

import { createClient } from "@supabase/supabase-js";

export const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);