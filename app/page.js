"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Instagram,
  MapPin,
  Phone,
  Truck,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

import api from "../services/api";
import ProductCard from "../components/ProductCard";
import BottomNav from "../components/BottomNav";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadHome() {
      try {
        const [productsResponse, categoriesResponse] =
          await Promise.all([
            api.get("/products"),
            api.get("/categories"),
          ]);

        const productData =
          productsResponse.data?.products ||
          productsResponse.data ||
          [];

        const categoryData =
          categoriesResponse.data?.categories ||
          categoriesResponse.data ||
          [];

        setProducts(Array.isArray(productData) ? productData : []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (error) {
        console.error("Home loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, []);

  const recentProducts = products.slice(0, 4);

  return (
    <main className="min-h-screen bg-[#F8F6F1] text-[#1C1C1A] pb-20 md:pb-0">

      <header className="sticky top-0 z-50 border-b border-[#D9D5CC]/60 bg-[#F8F6F1]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

          <Link href="/" className="group">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#7A8068]">
              Magotra
            </p>
            <p className="mt-0.5 text-lg font-semibold tracking-[0.08em]">
              BARTAN STORE
            </p>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-[#1C1C1A]"
            >
              Home
            </Link>

            <Link
              href="/collections"
              className="text-sm text-[#6F6D67] transition hover:text-[#1C1C1A]"
            >
              Collections
            </Link>

            <a
              href="#about"
              className="text-sm text-[#6F6D67] transition hover:text-[#1C1C1A]"
            >
              Our Story
            </a>

            <a
              href="#contact"
              className="text-sm text-[#6F6D67] transition hover:text-[#1C1C1A]"
            >
              Contact
            </a>

            <Link
              href="/account"
              className="text-sm text-[#6F6D67] transition hover:text-[#1C1C1A]"
            >
              Account
            </Link>

            <Link
              href="/cart"
              className="rounded-full border border-[#1C1C1A] px-5 py-2.5 text-sm font-medium transition hover:bg-[#1C1C1A] hover:text-white"
            >
              Cart
            </Link>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D9D5CC] md:hidden"
            aria-label="Open menu"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#D9D5CC]/60 bg-[#F8F6F1] px-5 py-5 md:hidden">
            <div className="flex flex-col gap-5">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium"
              >
                Home
              </Link>

              <Link
                href="/collections"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#6F6D67]"
              >
                Collections
              </Link>

              <a
                href="#about"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#6F6D67]"
              >
                Our Story
              </a>

              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#6F6D67]"
              >
                Contact
              </a>

              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#6F6D67]"
              >
                Account
              </Link>
            </div>
          </div>
        )}
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="grid overflow-hidden rounded-[2rem] bg-[#EDE8DE] lg:grid-cols-[1.05fr_0.95fr]">

          <div className="flex min-h-[480px] flex-col justify-center px-7 py-14 sm:px-12 lg:px-16 lg:py-20">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B89B72]" />
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#7A8068]">
                Magotra Bartan Store
              </span>
            </div>

            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              Beautiful crockery
              <br />
              for every table.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#68665F] sm:text-lg">
              Discover thoughtfully selected crockery and kitchen essentials
              that bring quality, elegance and everyday comfort to your home.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1C1C1A] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#33332F]"
              >
                Shop Collections
                <ArrowRight size={16} />
              </Link>

              <a
                href="#about"
                className="inline-flex items-center justify-center rounded-full border border-[#B8B2A7] px-7 py-3.5 text-sm font-medium text-[#1C1C1A] transition hover:bg-white"
              >
                Our Story
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-[#77736A]">
              <span>Quality Crockery</span>
              <span>Affordable Rates</span>
              <span>Worldwide Shipping</span>
            </div>
          </div>

          <div className="relative min-h-[360px] bg-[#D8D0C1] lg:min-h-[560px]">
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <div className="text-center">
                <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-[#B89B72]/60 bg-[#F8F6F1]/40 sm:h-48 sm:w-48">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#B89B72]/70 sm:h-32 sm:w-32">
                    <Sparkles
                      size={34}
                      strokeWidth={1}
                      className="text-[#8C7659]"
                    />
                  </div>
                </div>

                <p className="mt-7 text-xs uppercase tracking-[0.3em] text-[#716858]">
                  Since Day One
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-[#3A3833]">
                  Made for your home
                </p>
              </div>
            </div>

            <div className="absolute bottom-7 left-7 rounded-2xl border border-white/40 bg-[#F8F6F1]/70 px-5 py-4 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A8068]">
                Jammu
              </p>
              <p className="mt-1 text-sm font-medium">
                Serving homes everywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#D9D5CC]/70 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-[#D9D5CC]/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

          <div className="flex items-center gap-4 px-6 py-6 sm:px-8">
            <Truck size={23} strokeWidth={1.4} className="text-[#8D795E]" />
            <div>
              <p className="text-sm font-medium">Worldwide Shipping</p>
              <p className="mt-1 text-xs text-[#858178]">
                We deliver beyond borders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-6 sm:px-8">
            <ShieldCheck
              size={23}
              strokeWidth={1.4}
              className="text-[#8D795E]"
            />
            <div>
              <p className="text-sm font-medium">Quality First</p>
              <p className="mt-1 text-xs text-[#858178]">
                Carefully selected products
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-6 sm:px-8">
            <Sparkles
              size={23}
              strokeWidth={1.4}
              className="text-[#8D795E]"
            />
            <div>
              <p className="text-sm font-medium">Affordable Rates</p>
              <p className="mt-1 text-xs text-[#858178]">
                Beautiful without the premium
              </p>
            </div>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#7A8068]">
              Explore
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Shop by collection
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-[#77736A]">
              Find the right pieces for everyday meals, celebrations and
              everything in between.
            </p>
          </div>

          <Link
            href="/collections"
            className="hidden items-center gap-2 text-sm font-medium sm:flex"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.length > 0 ? (
            categories.slice(0, 8).map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group relative flex min-h-[190px] items-end overflow-hidden rounded-2xl bg-[#E9E5DC] p-5 transition hover:-translate-y-0.5 sm:min-h-[230px]"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

                <div className="relative z-10">
                  <p className="text-sm font-medium text-white sm:text-base">
                    {category.name}
                  </p>
                  <p className="mt-1 text-xs text-white/75">
                    Explore collection
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-[#D9D5CC] bg-white p-10 text-center">
              <p className="text-sm text-[#77736A]">
                Collections are being prepared.
              </p>
            </div>
          )}
        </div>

        <Link
          href="/collections"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium sm:hidden"
        >
          View all collections
          <ArrowRight size={16} />
        </Link>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">

          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#7A8068]">
                New arrivals
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Recently added
              </h2>
            </div>

            <Link
              href="/collections"
              className="hidden items-center gap-2 text-sm font-medium sm:flex"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item}>
                  <div className="aspect-square animate-pulse rounded-2xl bg-[#F0EEE9]" />
                  <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-[#F0EEE9]" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#F0EEE9]" />
                </div>
              ))}
            </div>
          ) : recentProducts.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4">
              {recentProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-[#D9D5CC] p-10 text-center">
              <p className="text-sm text-[#77736A]">
                New products will appear here as they are added.
              </p>
            </div>
          )}

        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid overflow-hidden rounded-[2rem] bg-[#EDE8DE] lg:grid-cols-2">

          <div className="flex min-h-[400px] items-center justify-center p-10 lg:min-h-[500px]">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#7A8068]">
                Our story
              </p>

              <div className="mx-auto mt-6 flex h-44 w-44 items-center justify-center rounded-full border border-[#B89B72]/70 sm:h-56 sm:w-56">
                <div className="text-center">
                  <p className="text-3xl font-semibold tracking-tight">
                    Magotra
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#77736A]">
                    Bartan Store
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#7A8068]">
              More than crockery
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Pieces that make
              <br />
              a house feel like home.
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#6E6A61]">
              At Magotra Bartan Store, we believe everyday dining deserves
              beautiful things. From practical everyday pieces to crockery
              for special occasions, our collection is selected with quality,
              value and style in mind.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#6E6A61]">
              Based in Jammu, we serve customers across India and around the
              world.
            </p>

            <Link
              href="/collections"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#1C1C1A] px-6 py-3 text-sm font-medium transition hover:bg-[#1C1C1A] hover:text-white"
            >
              Explore the store
              <ArrowRight size={15} />
            </Link>
          </div>

        </div>
      </section>

      <section id="contact" className="bg-[#1C1C1A] text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#B89B72]">
                Stay connected
              </p>

              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
                Let&apos;s find something beautiful for your table.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/60">
                Have a question about a product or want to see more of our
                collection? Get in touch with us directly.
              </p>
            </div>

            <div className="space-y-4">

              <a
                href="tel:9682588821"
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <Phone size={20} strokeWidth={1.4} />
                <div>
                  <p className="text-xs text-white/45">Call us</p>
                  <p className="mt-1 text-sm font-medium">
                    96825 88821
                  </p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/magotrabartanstore/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <Instagram size={20} strokeWidth={1.4} />
                <div>
                  <p className="text-xs text-white/45">Instagram</p>
                  <p className="mt-1 text-sm font-medium">
                    @magotrabartanstore
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <MapPin size={20} strokeWidth={1.4} />
                <div>
                  <p className="text-xs text-white/45">Based in</p>
                  <p className="mt-1 text-sm font-medium">
                    Jammu, India
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      <footer className="bg-[#1C1C1A] px-5 pb-10 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold tracking-[0.12em]">
              MAGOTRA BARTAN STORE
            </p>
            <p className="mt-1 text-xs text-white/40">
              Quality crockery at affordable rates.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs text-white/50">
            <Link href="/collections" className="hover:text-white">
              Collections
            </Link>
            <Link href="/account" className="hover:text-white">
              Account
            </Link>
            <Link href="/cart" className="hover:text-white">
              Cart
            </Link>
            <a
              href="https://www.instagram.com/magotrabartanstore/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Instagram
            </a>
          </div>

          <p className="text-xs text-white/30">
            © 2026 Magotra Bartan Store
          </p>

        </div>
      </footer>

      <BottomNav />
    </main>
  );
}
