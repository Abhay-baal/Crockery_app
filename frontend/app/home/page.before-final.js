"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import api from "../../services/api";
import BottomNav from "../../components/BottomNav";
import SearchBar from "../../components/SearchBar";
import ProductCard from "../../components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isRecentPaused, setIsRecentPaused] = useState(false);
  const [isCollectionsPaused, setIsCollectionsPaused] = useState(false);

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

        setProducts(
          Array.isArray(productData) ? productData : []
        );

        setCategories(
          Array.isArray(categoryData) ? categoryData : []
        );
      } catch (error) {
        console.error("Home loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, []);

  const recentProducts = products
    .filter((product) => product.isRecentlyAdded === true)
    .slice(0, 6);

  const pinnedProducts = products
    .filter(
      (product) =>
        product.isPinned === true ||
        product.pinned === true ||
        product.featured === true
    )
    .slice(0, 4);

  const collectionItems = categories.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#FCFCFA] pb-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">

        {/* Welcome */}
        <section className="pb-6 pt-2">
          <p className="text-sm text-gray-400">
            Welcome back
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            Find something beautiful.
          </h1>

          <div className="mt-5">
            <Suspense
              fallback={
                <div className="h-12 rounded-2xl bg-gray-100" />
              }
            >
              <SearchBar />
            </Suspense>
          </div>
        </section>

        {/* Recently Added */}
        <section className="mt-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8A8D80]">
                New
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-950">
                Recently added
              </h2>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DCDCD4] bg-white px-4 py-2 text-xs font-medium text-[#70765F] transition hover:border-[#70765F] hover:bg-[#F5F5F0]"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="home-landing-marquee">
              <div className="home-landing-copy">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="home-landing-card animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-gray-100" />

                    <div className="px-5 py-4">
                      <div className="h-4 w-3/4 rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                      <div className="mt-3 h-4 w-1/3 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="rounded-2xl bg-[#F7F7F4] p-8 text-center">
              <p className="text-sm text-gray-400">
                No recently added products yet.
              </p>
            </div>
          ) : (
            <div
              className={`home-landing-marquee ${
                isRecentPaused ? "home-landing-paused" : ""
              }`}
              onMouseEnter={() => setIsRecentPaused(true)}
              onMouseLeave={() => setIsRecentPaused(false)}
            >
              <div className="home-landing-track">
                {[0, 1].map((copy) => (
                  <div
                    key={`recent-copy-${copy}`}
                    className="home-landing-copy"
                    aria-hidden={copy === 1}
                  >
                    {recentProducts.map((product, index) => (
                      <HomeRecentCard
                        key={`${product._id}-${copy}`}
                        product={product}
                        index={index}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Pinned */}
        {pinnedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8A8D80]">
                Curated
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-950">
                Pinned for you
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4">
              {pinnedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          </section>
        )}

        {/* Collections */}
        <section className="mt-12 pb-4">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8A8D80]">
                Explore
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-950">
                Collections
              </h2>
            </div>

            <Link
              href="/collections"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DCDCD4] bg-white px-4 py-2 text-xs font-medium text-[#70765F] transition hover:border-[#70765F] hover:bg-[#F5F5F0]"
            >
              See all
              <ArrowRight size={14} />
            </Link>
          </div>

          {collectionItems.length === 0 ? (
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
              className={`home-landing-marquee ${
                isCollectionsPaused ? "home-landing-paused" : ""
              }`}
              onMouseEnter={() => setIsCollectionsPaused(true)}
              onMouseLeave={() => setIsCollectionsPaused(false)}
            >
              <div className="home-landing-track home-collections-track">
                {[0, 1].map((copy) => (
                  <div
                    key={`collection-copy-${copy}`}
                    className="home-landing-copy"
                    aria-hidden={copy === 1}
                  >
                    {collectionItems.map((category, index) => (
                      <HomeCollectionCard
                        key={`${category._id}-${copy}`}
                        category={category}
                        index={index}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>

      <BottomNav />
    </main>
  );
}


/* =====================================================
   HOME — Recently Added Card
   Same visual language as landing page
   ===================================================== */

function HomeRecentCard({ product, index }) {
  const image =
    product.images?.[0] ||
    product.image ||
    product.imageUrl ||
    "";

  return (
    <Link
      href={`/products/${product._id}`}
      className="home-landing-card group"
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
          New {String(index + 1).padStart(2, "0")}
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

        {product.category?.name && (
          <p className="mt-1 text-xs text-gray-400">
            {product.category.name}
          </p>
        )}

        <p className="mt-3 text-sm font-medium text-[#6F755F]">
          ₹{Number(product.price || 0).toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}


/* =====================================================
   HOME — Collection Card
   Same visual language as landing page
   ===================================================== */

function HomeCollectionCard({ category, index }) {
  const image =
    category.image ||
    category.images?.[0] ||
    "";

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="home-landing-card group"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3F3EE]">
        {image ? (
          <img
            src={image}
            alt={category.name || "Collection"}
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
          Collection {String(index + 1).padStart(2, "0")}
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

        <p className="mt-1 text-xs text-gray-400">
          Explore collection
        </p>
      </div>
    </Link>
  );
}
