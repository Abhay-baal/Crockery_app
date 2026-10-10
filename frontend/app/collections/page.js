"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import api from "../../services/api";
import BottomNav from "../../components/BottomNav";
import SearchBar from "../../components/SearchBar";

import PageShortcuts from "../../components/PageShortcuts";
export default function CollectionsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.get("/categories");

        const data =
          response.data?.categories ||
          response.data ||
          [];

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Collections error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* Header */}
        <section className="pb-8 pt-4 sm:pb-10 sm:pt-6">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
            Discover
          </p>

          <div className="flex items-center justify-between gap-3">
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Collections</h1>
            <PageShortcuts />
          </div>



          <div className="mt-5 max-w-xl">
            <Suspense
              fallback={
                <div className="h-12 rounded-2xl bg-gray-100" />
              }
            >
              <SearchBar placeholder="Search products..." />
            </Suspense>
          </div>
        </section>

        {/* Collection Cards */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-[#E8E8E2] bg-white"
              >
                <div className="aspect-[4/3] animate-pulse bg-[#F3F3EE]" />

                <div className="px-5 py-4 sm:px-6 sm:py-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-3xl border border-[#E8E8E2] bg-white px-6 py-16 text-center">
            <ShoppingBag
              size={32}
              strokeWidth={1.3}
              className="mx-auto text-[#8A8D80]"
            />

            <p className="mt-4 text-sm text-gray-400">
              Collections will appear here soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category, categoryIndex) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-3xl border border-[#E8E8E2] bg-white"
              >
                {/* EXACT CAROUSEL IMAGE AREA */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3F3EE]">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name || "Collection"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingBag
                        size={58}
                        strokeWidth={1.1}
                        className="text-[#8A8D80]"
                      />
                    </div>
                  )}

                  {/* EXACT CAROUSEL LABEL */}
                  <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#70765F] backdrop-blur-sm">
                    Collection{" "}
                    {String(categoryIndex + 1).padStart(2, "0")}
                  </div>

                  {/* EXACT CAROUSEL ARROW */}
                  <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#70765F] shadow-sm transition duration-300 group-hover:bg-[#70765F] group-hover:text-white">
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </div>
                </div>

                {/* EXACT CAROUSEL CARD CONTENT */}
                <div className="px-5 py-4 sm:px-6 sm:py-5">
                  <h2 className="line-clamp-1 text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                    {category.name}
                  </h2>

                  <p className="mt-1.5 text-xs text-gray-400 sm:text-sm">
                    Explore collection
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
