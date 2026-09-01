import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (process.env.AUTH_MODE !== "entra") return NextResponse.next();
  const hasSession = request.cookies.has("trace_session");
  if (!hasSession && !request.nextUrl.pathname.startsWith("/login"))
    return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
