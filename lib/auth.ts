import { supabaseService } from "./supabase";

/**
 * Resolve user from a bearer token (server-side).
 * Returns null if token absent/invalid.
 */
export async function resolveUser(bearerToken?: string | null) {
  if (!bearerToken) return null;
  // bearerToken may include "Bearer " prefix if you pass req.headers.get('authorization')
  const token = bearerToken.startsWith?.("Bearer ") ? bearerToken.split(" ")[1] : bearerToken;
  const { data, error } = await supabaseService.auth.getUser(token);
  if (error) {
    // server-side: rethrow so caller can return 401/500 as appropriate
    throw error;
  }
  return data.user ?? null;
}
