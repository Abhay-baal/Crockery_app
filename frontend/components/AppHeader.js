"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const subscribe = () => () => {};
const getHomeHref = () =>
  typeof window !== "undefined" && localStorage.getItem("token")
    ? "/home"
    : "/";
const getServerHomeHref = () => "/";

export default function AppHeader() {
  const homeHref = useSyncExternalStore(
    subscribe,
    getHomeHref,
    getServerHomeHref
  );

  return (
    <header className="border-b border-[#E8E8E2] bg-[#FCFCFA]">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">

        {/* Logo */}
        <Link href={homeHref} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#70765F] text-sm font-semibold text-white">
            M
          </div>

          <div>
            <p className="text-base font-semibold tracking-tight text-gray-950 sm:text-lg">
              Magotra Bartan Store
            </p>

            <p className="text-[9px] uppercase tracking-[0.16em] text-[#8A8D80] sm:text-[10px]">
              Crockery & Kitchen Essentials
            </p>
          </div>
        </Link>

        {/* Login / Sign Up */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 transition hover:text-[#70765F]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-[#70765F] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#5F654F] sm:px-5"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </header>
  );
}
