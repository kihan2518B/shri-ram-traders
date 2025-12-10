"use server"
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("pathname: ", pathname)
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  const cookieHeader = request.headers.get('cookie');
  const cookiesObj = cookieHeader ? parse(cookieHeader) : {};

  const userCookie = cookiesObj['user'];

  if (!userCookie && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (userCookie && isPublic && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
