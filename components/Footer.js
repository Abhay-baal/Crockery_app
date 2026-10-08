import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1C1C1A] px-5 pb-24 pt-14 text-white md:pb-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold tracking-[0.15em]">
              MAGOTRA
            </p>
            <p className="mt-1 text-[10px] tracking-[0.3em] text-[#B89B72]">
              BARTAN STORE
            </p>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
              Quality crockery, beautiful tableware and affordable prices from
              Jammu.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              Explore
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/"
                className="block text-sm text-white/70 hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/categories"
                className="block text-sm text-white/70 hover:text-white"
              >
                Collections
              </Link>

              <Link
                href="/account"
                className="block text-sm text-white/70 hover:text-white"
              >
                My Account
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              Contact
            </p>

            <div className="mt-5 space-y-4 text-sm text-white/70">
              <a
                href="tel:9682588821"
                className="flex items-center gap-3 hover:text-white"
              >
                <Phone size={16} />
                9682588821
              </a>

              <p className="flex items-center gap-3">
                <MapPin size={16} />
                Jammu, India
              </p>

              <a
                href="https://instagram.com/magotrabartanstore"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 hover:text-white"
              >
                <Instagram size={16} />
                @magotrabartanstore
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/35">
          © 2026 Magotra Bartan Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
