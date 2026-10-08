"use client";

import Link from "next/link";
import { ShoppingBag, UserRound } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#D9D5CC]/70 bg-[#F8F6F1]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:h-20 lg:px-8">
          <Link href="/" className="group">
            <p className="text-[15px] font-bold tracking-[0.18em] text-[#1C1C1A]">
              MAGOTRA
            </p>
            <p className="text-[9px] font-medium tracking-[0.3em] text-[#7A8068]">
              BARTAN STORE
            </p>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm text-[#1C1C1A] transition hover:text-[#B89B72]"
            >
              Home
            </Link>

            <Link
              href="/categories"
              className="text-sm text-[#1C1C1A] transition hover:text-[#B89B72]"
            >
              Collections
            </Link>

            <Link
              href="/#about"
              className="text-sm text-[#1C1C1A] transition hover:text-[#B89B72]"
            >
              Our Story
            </Link>

            <Link
              href="/#contact"
              className="text-sm text-[#1C1C1A] transition hover:text-[#B89B72]"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white"
              aria-label="Account"
            >
              <UserRound size={19} strokeWidth={1.7} />
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white"
              aria-label="Cart"
            >
              <ShoppingBag size={19} strokeWidth={1.7} />

              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1C1C1A] px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#D9D5CC] bg-white/95 px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <MobileNav href="/" label="Home" />
          <MobileNav href="/categories" label="Collections" />
          <MobileNav href="/cart" label={`Cart${cartCount ? ` (${cartCount})` : ""}`} />
          <MobileNav href="/account" label="Account" />
        </div>
      </nav>
    </>
  );
}

function MobileNav({ href, label }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-xs font-medium text-[#5f5d58] transition hover:text-[#1C1C1A]"
    >
      {label}
    </Link>
  );
}
