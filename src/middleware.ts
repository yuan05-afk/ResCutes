import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/mobile/:path*",
    "/dashboard/:path*",
    "/rescue-cases/:path*",
    "/animals/:path*",
    "/settings/:path*",
  ],
};
