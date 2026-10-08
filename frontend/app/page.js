"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Pause,
  Play,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import api from "../services/api";
import ProductCard from "../components/ProductCard";
import AppHeader from "../components/AppHeader";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [isCollectionsPaused, setIsCollectionsPaused] = useState(false);
  const [isRecentlyAddedPaused, setIsRecentlyAddedPaused] = useState(false);

  useEffect(() => {
    async function loadHome() {
      try {
        const [
          productsResponse,
          categoriesResponse,
          recentlyAddedResponse,
        ] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/products/recently-added"),
        ]);

        const productData =
          productsResponse.data?.products ||
          productsResponse.data ||
          [];

        const categoryData =
          categoriesResponse.data?.categories ||
          categoriesResponse.data ||
          [];

        const recentlyAddedData =
          recentlyAddedResponse.data?.products ||
          recentlyAddedResponse.data ||
          [];

        setProducts(Array.isArray(productData) ? productData : []);
        setCategories(
          Array.isArray(categoryData)
            ? categoryData.slice(0, 18)
            : []
        );
        setRecentlyAdded(
          Array.isArray(recentlyAddedData)
            ? recentlyAddedData.slice(0, 6)
            : []
        );
      } catch (error) {
        console.error("Home loading error:", error);
      }
    }

    loadHome();
  }, []);

  const pinnedProducts = products
    .filter(
      (product) =>
        product.isPinned === true ||
        product.pinned === true ||
        product.featured === true
    )
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#FCFCFA] text-gray-900">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">

        <AppHeader />

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[#EAEAE4] py-10 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">

            {/* Hero Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E7E0] bg-white px-4 py-2 text-xs font-medium tracking-[0.14em] text-[#70765F]">
                <Sparkles size={14} />
                MAGOTRA BARTAN STORE
              </div>

              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                Beautiful essentials
                <br />
                for every kitchen.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
                Discover quality bartan, crockery and everyday kitchen
                essentials at Magotra Bartan Store — bringing practical
                products and timeless style to your home.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#70765F] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#5F654F]"
                >
                  Shop products
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DCDCD4] bg-white px-6 py-3.5 text-sm font-medium text-gray-800 transition hover:bg-[#F5F5F0]"
                >
                  Explore collections
                </Link>
              </div>
            </div>

            {/* Future Image Area */}
            <div className="relative">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] border border-[#E5E5DE] bg-[#F3F3EE]">

                {/* Temporary SVG Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    viewBox="0 0 500 380"
                    className="h-full w-full p-12 text-[#B4B7A8]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="90"
                      y="100"
                      width="320"
                      height="190"
                      rx="28"
                      stroke="currentColor"
                      strokeWidth="3"
                    />

                    <path
                      d="M135 245L205 175L260 225L310 165L365 245"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <circle
                      cx="205"
                      cy="155"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="3"
                    />

                    <path
                      d="M155 315H345"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="absolute bottom-5 left-5 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-medium text-[#70765F] backdrop-blur-sm">
                  Magotra Bartan Store
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Recently Added */}
        {recentlyAdded.length > 0 && (
          <section className="border-t border-[#EAEAE4] py-16 sm:py-24">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8A8D80]">
                  Recently Added
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                  Recently Added
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                  Fresh additions to our collection, selected for modern
                  everyday living.
                </p>
              </div>

              <button
                type="button"
                aria-pressed={isRecentlyAddedPaused}
                aria-label={
                  isRecentlyAddedPaused
                    ? "Resume recently added movement"
                    : "Pause recently added movement"
                }
                onClick={() =>
                  setIsRecentlyAddedPaused((isPaused) => !isPaused)
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DCDCD4] bg-white px-3.5 py-2 text-sm font-medium text-[#70765F] transition hover:border-[#70765F] hover:bg-[#F5F5F0]"
              >
                {isRecentlyAddedPaused ? (
                  <Play size={14} fill="currentColor" />
                ) : (
                  <Pause size={14} />
                )}

                <span className="hidden sm:inline">
                  {isRecentlyAddedPaused ? "Resume" : "Pause"}
                </span>
              </button>
            </div>

            <div
              className={`recently-added-marquee ${
                isRecentlyAddedPaused
                  ? "recently-added-marquee-paused"
                  : ""
              }`}
            >
              <div
                className="recently-added-marquee-track"
                style={{
                  animationPlayState: isRecentlyAddedPaused
                    ? "paused"
                    : "running",
                }}
              >
                {[0, 1].map((copy) => (
                  <div
                    key={`recently-added-copy-${copy}`}
                    className="recently-added-marquee-copy"
                    aria-hidden={copy === 1}
                  >
                    {recentlyAdded.map((product, index) => {
                      const image =
                        product.images?.[0] ||
                        product.image ||
                        product.imageUrl ||
                        "";

                      return (
                        <Link
                          key={`${product._id}-${copy}`}
                          href="/register"
                          className="recently-added-card group"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3F3EE]">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name || "Product"}
                                className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
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

                            <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#70765F] backdrop-blur-sm">
                              New{" "}
                              {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#70765F] shadow-sm transition duration-300 group-hover:bg-[#70765F] group-hover:text-white">
                              <ArrowRight
                                size={17}
                                className="transition-transform duration-300 group-hover:translate-x-0.5"
                              />
                            </div>
                          </div>

                          <div className="px-5 py-4 sm:px-6 sm:py-5">
                            <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                              {product.name || "Untitled Product"}
                            </h3>

                            <p className="mt-1.5 line-clamp-1 text-xs text-gray-400 sm:text-sm">
                              {product.category?.name || "Crockery"}
                            </p>

                            <p className="mt-2 text-sm font-medium text-[#70765F] sm:text-base">
                              ₹
                              {Number(product.price || 0).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}


        {/* Collections */}
        <section className="border-t border-[#EAEAE4] py-16 sm:py-24">
          <div className="mb-10 flex items-end justify-between gap-4 px-0">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8A8D80]">
                Explore
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                Shop by collection
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                Explore our collection of crockery and kitchen essentials.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={isCollectionsPaused}
                aria-label={
                  isCollectionsPaused
                    ? "Resume collection movement"
                    : "Pause collection movement"
                }
                onClick={() =>
                  setIsCollectionsPaused((isPaused) => !isPaused)
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DCDCD4] bg-white px-3.5 py-2 text-sm font-medium text-[#70765F] transition hover:border-[#70765F] hover:bg-[#F5F5F0]"
              >
                {isCollectionsPaused ? (
                  <Play size={14} fill="currentColor" />
                ) : (
                  <Pause size={14} />
                )}
                <span className="hidden sm:inline">
                  {isCollectionsPaused ? "Resume" : "Pause"}
                </span>
              </button>

              <Link
                href="/categories"
                className="hidden items-center gap-1.5 rounded-full border border-[#DCDCD4] bg-white px-4 py-2 text-sm font-medium text-[#70765F] transition hover:border-[#70765F] hover:bg-[#F5F5F0] sm:inline-flex"
              >
                See all
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {categories.length === 0 ? (
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
            <div
              className={`collection-marquee-wrapper space-y-5 sm:space-y-6 ${
                isCollectionsPaused ? "collection-marquee-paused" : ""
              }`}
            >
              {Array.from(
                { length: Math.ceil(categories.length / 6) },
                (_, rowIndex) => {
                  const rowCategories = categories.slice(
                    rowIndex * 4,
                    rowIndex * 4 + 4
                  );

                  const movingRight = rowIndex % 2 === 0;

                  return (
                    <div
                      key={`collection-row-${rowIndex}`}
                      className="collection-marquee"
                    >
                      <div
                        className={`collection-marquee-track ${
                          movingRight
                            ? "collection-marquee-right"
                            : "collection-marquee-left"
                        }`}
                        style={{
                          animationPlayState: isCollectionsPaused
                            ? "paused"
                            : "running",
                        }}
                      >
                        {[0, 1].map((copy) => (
                          <div
                            key={`collection-copy-${rowIndex}-${copy}`}
                            className="collection-marquee-copy"
                            aria-hidden={copy === 1}
                          >
                            {rowCategories.map((category, categoryIndex) => {
                              const actualIndex =
                                rowIndex * 4 + categoryIndex;

                              return (
                                <Link
                                  key={`${category._id}-${copy}`}
                                  href="/register"
                                  className="collection-card group"
                                >
                                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3F3EE]">
                                    {category.image ? (
                                      <img
                                        src={category.image}
                                        alt={
                                          category.name || "Collection"
                                        }
                                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
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

                                    <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#70765F] backdrop-blur-sm">
                                      Collection{" "}
                                      {String(actualIndex + 1).padStart(
                                        2,
                                        "0"
                                      )}
                                    </div>

                                    <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#70765F] shadow-sm transition duration-300 group-hover:bg-[#70765F] group-hover:text-white">
                                      <ArrowRight
                                        size={17}
                                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                                      />
                                    </div>
                                  </div>

                                  <div className="px-5 py-4 sm:px-6 sm:py-5">
                                    <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                                      {category.name}
                                    </h3>

                                    <p className="mt-1.5 text-xs text-gray-400 sm:text-sm">
                                      Explore collection
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          <Link
            href="/categories"
            className="mt-7 flex items-center justify-center gap-1.5 text-sm font-medium text-[#70765F] sm:hidden"
          >
            See all collections
            <ArrowRight size={15} />
          </Link>
        </section>

        {/* Featured */}
        {pinnedProducts.length > 0 && (
          <section className="border-t border-[#EAEAE4] py-12 sm:py-16">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8A8D80]">
                Curated selection
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Customer favourites
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
              {pinnedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-10 bg-[#F4F4EF] text-gray-900">
          <div className="px-6 py-12 sm:px-10 sm:py-14">

            <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">

              {/* Brand */}
              <div className="max-w-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#70765F] text-sm font-semibold text-white">
                    M
                  </div>

                  <div>
                    <p className="text-lg font-semibold tracking-tight">
                      Magotra Bartan Store
                    </p>

                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      Crockery & Kitchen Essentials
                    </p>
                  </div>
                </div>

                <p className="mt-6 max-w-sm text-sm leading-6 text-gray-500">
                  Quality crockery and kitchen essentials for everyday living.
                  Carefully selected products for every home.
                </p>
              </div>

              {/* Store Information */}
              <div className="sm:min-w-[230px]">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                  Store Information
                </p>

                <div className="space-y-3 text-sm text-gray-600">
                  <p>☎️ 9682588821</p>
                  <p>🌎 Worldwide Shipping</p>
                  <p>🙏 No return</p>
                </div>
              </div>

              {/* Instagram */}
              <div className="sm:min-w-[210px]">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                  Follow Us
                </p>

                <a
                  href="https://www.instagram.com/magotrabartanstore/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-[#E2E2DA] bg-white/70 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:border-[#D5D5CC] hover:bg-white"
                >
                  @magotrabartanstore
                </a>

                <p className="mt-3 text-xs text-gray-400">
                  33.6k followers · 295 following
                </p>
              </div>

            </div>

            {/* Bottom */}
            <div className="mt-10 border-t border-[#E2E2DA] pt-6">
              <div className="flex flex-col gap-2 text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  © 2026 Magotra Bartan Store
                </p>

                <p>
                  Made for every kitchen.
                </p>
              </div>
            </div>

          </div>
        </footer>

      </div>

    </main>
  );
}
