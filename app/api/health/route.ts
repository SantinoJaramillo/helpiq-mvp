import { NextResponse } from "next/server";
import { withCORS, preflight } from "../_cors";

export async function OPTIONS() { return preflight(); }

export async function GET() {
  const ok =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  return withCORS(NextResponse.json({ ok, url: process.env.NEXT_PUBLIC_SUPABASE_URL }));
}
