"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers3, ShoppingBag, User } from "lucide-react";

const items = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Collections", href: "/collections", icon: Layers3 },
  { label: "Products", href: "/products", icon: ShoppingBag },
  { label: "Account", href: "/account", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-3 py-2">
        {items.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs transition ${
                active
                  ? "font-medium text-[#6F755F]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.6} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
