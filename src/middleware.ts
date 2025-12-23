"use server";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  const user = request.cookies.get("user")?.value;
  
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isPublic && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  if (user) {
    response.headers.set("x-user", user);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
