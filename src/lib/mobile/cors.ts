import { NextResponse } from "next/server";

const allowedOrigin = process.env.MOBILE_CORS_ORIGIN ?? "*";

export function withMobileCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Vary", "Origin");
  return response;
}

export function mobileCorsOptions() {
  return withMobileCors(new NextResponse(null, { status: 204 }));
}
