import { NextRequest, NextResponse } from "next/server";
import { resolveUser } from "@/lib/auth";
import { withCORS, preflight } from "../_cors";

export async function OPTIONS() { return preflight(); }

export async function GET(req: NextRequest) {
  const identity = await resolveUser(req);
  if (!identity) return withCORS(NextResponse.json({ error: "No/invalid token" }, { status: 401 }));
  return withCORS(NextResponse.json(identity));
}
