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
  const hasToken =
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (!isPublic && !hasToken) {
      const redirect = encodeURIComponent(pathname || "/home");
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [hasToken, isPublic, pathname, router]);

  return children;
}