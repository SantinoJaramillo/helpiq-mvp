import { NextResponse } from "next/server";
import { withCORS, handleOptions } from "../_cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  const payload = {
    ok: true,
    env: {
      supabase_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      openai_api_key: !!process.env.OPENAI_API_KEY,
    },
  };
  return withCORS(NextResponse.json(payload));
}
