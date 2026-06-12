import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAuthPage) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-company-id", String(token.companyId ?? ""));
  requestHeaders.set("x-user-role", String(token.role ?? "USER"));

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|icons).*)"]
};
