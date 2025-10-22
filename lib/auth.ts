import { NextRequest } from "next/server";
import { supabaseService } from "./supabase";

export async function resolveUser(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;

  const token = m[1];
  const { data, error } = await supabaseService.auth.getUser(token);
  if (error || !data?.user) return null;

  const userId = data.user.id;
  // (MVP) slå upp ev. company/role i egen tabell om du har den
  const { data: row } = await supabaseService
    .from("users")
    .select("company_id, role")
    .eq("id", userId)
    .maybeSingle();

  return { userId, companyId: row?.company_id ?? null, role: row?.role ?? null };
}
