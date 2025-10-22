import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const { userId, context } = await req.json(); // ex: { mode, manualId, companyId }
  // Minimal session (ChatKit läser denna token i klienten)
  const session = await openai.chat.sessions.create({
    metadata: { userId, ...context }
  });
  return NextResponse.json({ clientToken: session.client_token });
}