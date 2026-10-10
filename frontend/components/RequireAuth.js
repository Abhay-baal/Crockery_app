"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const publicPaths = new Set([
  "/",
  "/categories",
  "/login",
  "/register",
]);

export default function RequireAuth({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = publicPaths.has(pathname);

  // Admin pages use their own authentication, not customer login.
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  const hasToken =
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (!isPublic && !isAdmin && !hasToken) {
      const redirect = encodeURIComponent(pathname || "/home");
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [hasToken, isPublic, isAdmin, pathname, router]);

  return children;
}