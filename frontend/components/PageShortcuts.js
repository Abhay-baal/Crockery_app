"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function PageShortcuts() {
  const { cartCount } = useCart();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href="/account/saved"
        aria-label="Liked items"
        title="Liked items"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8E8E2] bg-white text-[#44483B] transition hover:bg-[#F5F5F1]"
      >
        <Heart size={19} strokeWidth={1.7} />
      </Link>

      <Link
        href="/cart"
        className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-stone-50"
        aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
      >
        <ShoppingBag size={17} />
        <span>Cart</span>
        {cartCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] text-white">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}
