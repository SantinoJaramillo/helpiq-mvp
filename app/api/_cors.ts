import { NextResponse } from "next/server";

const FRONTEND_ORIGIN = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN ?? "*";

function defaultCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function withCORS(res: NextResponse) {
  const headers = defaultCorsHeaders();
  for (const k of Object.keys(headers)) {
    res.headers.set(k, (headers as any)[k]);
  }
  return res;
}

export function handleOptions() {
  const res = new NextResponse(null, { status: 204 });
  return withCORS(res);
}
