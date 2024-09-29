import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/auth") {
    // Unauthenticated user request
    const newUrl = new URL("/auth", req.nextUrl.origin);
    return Response.redirect(newUrl);
  } else if (req.auth && req.nextUrl.pathname === "/auth") {
    // Authenticated user request
    if (req.nextUrl.pathname === "/auth") {
      const newUrl = new URL("/", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
