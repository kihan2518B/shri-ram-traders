// import { NextResponse, type NextRequest } from "next/server";
// import { createClient } from "@/utils/supabase/middleware";

// export async function middleware(request: NextRequest) {
//   const { supabase, response } = createClient(request);
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const pathname = request.nextUrl.pathname;
//   // Public routes accessible without login
//   const publicRoutes = [
//     "/",
//     "/login",
//     "/signup",
//     "/callback",
//     "/api/auth/session",
//     "/about",
//     "/privacypolicy",
//     "/termsandconditions",
//     "/usepolicy",
//     "/api/auth/callback",
//   ];
//   const isPublicApiUserRoute = pathname.startsWith("/api/users");
//   const isAuthPage =
//     pathname.startsWith("/login") || pathname.startsWith("/signup");

//   // If the user is logged in and tries to access login or signup, redirect to home
//   if (user && isAuthPage) {
//     return NextResponse.redirect(
//       new URL(
//         user.user_metadata.role == "USER" ? "/projects" : "/admin",
//         request.url
//       )
//     );
//   }
//   // If the user is not logged in and is not visiting a public route or public API route, redirect to login
//   if (!user && !publicRoutes.includes(pathname) && !isPublicApiUserRoute) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // If user tries to access /admin but is not an admin
//   if (pathname.startsWith("/admin") && user?.user_metadata.role !== "ADMIN") {
//     return NextResponse.redirect(new URL("/projects", request.url));
//   }

//   return NextResponse.next();

// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // Matches all except Next.js internals
// };

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";
import { checkRateLimit } from "@/lib/rate-limmiter";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const method = request.method;
  const ip =
    request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  const userId = user?.id ?? ip;

  // ---------- PUBLIC ROUTES ----------
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/callback",
    "/api/auth/session",
    "/about",
    "/privacypolicy",
    "/termsandconditions",
    "/usepolicy",
    "/api/auth/callback",
  ];
  const isPublicApiUserRoute = pathname.startsWith("/api/users");
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  // ---------- REDIRECT AUTHENTICATED USERS AWAY FROM LOGIN/SIGNUP ----------
  if (user && isAuthPage) {
    return NextResponse.redirect(
      new URL(
        user.user_metadata.role === "USER" ? "/projects" : "/admin",
        request.url
      )
    );
  }

  // ---------- REDIRECT UNAUTHENTICATED USERS ----------
  if (!user && !publicRoutes.includes(pathname) && !isPublicApiUserRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ---------- REDIRECT UNAUTHORIZED ADMIN ACCESS ----------
  if (pathname.startsWith("/admin") && user?.user_metadata.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  // ---------- RATE LIMIT LOGIC ----------
  const isValidationAPI =
    pathname === "/api/validate" ||
    /^\/api\/validate\/[\w-]+$/.test(pathname) ||
    /^\/api\/validate\/[\w-]+\/[\w-]+$/.test(pathname);

  if (isValidationAPI && (method === "POST" || method === "PATCH")) {
    const { allowed } = await checkRateLimit({
      key: `rate:validation:daily:${userId}`,
      limit: 5,
      windowSeconds: 86400, // 1 day
    });
    if (!allowed) {
      return NextResponse.json(
        { message: "Validation API rate limit (5/day) exceeded" },
        { status: 429 }
      );
    }
  } else if (pathname.startsWith("/api/")) {
    const { allowed } = await checkRateLimit({
      key: `rate:generic:minute:${ip}`,
      limit: 50,
      windowSeconds: 60, // 50 requests per minute per IP per min
    });
    if (!allowed) {
      return NextResponse.json(
        { message: "Too many requests, slow down." },
        { status: 429 }
      );
    }
  }

  return response ?? NextResponse.next();
}

// Apply to all routes except static files
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
