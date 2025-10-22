export const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN ?? "*";

export function withCORS(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.headers.set("Access-Control-Allow-Headers", "content-type, authorization");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  return res;
}

export function preflight() {
  return withCORS(new Response(null, { status: 204 }));
}
