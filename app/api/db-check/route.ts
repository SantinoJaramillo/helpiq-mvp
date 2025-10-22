// Sanity check DB
import { NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAnon.from("manuals").select("id, model_name").limit(1);
  return NextResponse.json({ ok: !error, data, error: error?.message });
}
