"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import api from "../../services/api";
import BottomNav from "../../components/BottomNav";
import SearchBar from "../../components/SearchBar";
import ProductCard from "../../components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const pinnedProducts = products.filter(
    (product) =>
      product.isPinned === true ||
      product.pinned === true ||
      product.featured === true
  ).slice(0, 4);

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">


        <section className="pb-6 pt-2">
          <p className="text-sm text-gray-400">
            Welcome back
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            Find something beautiful.
          </h1>

          <div className="mt-5">
            <Suspense fallback={<div className="h-12 rounded-2xl bg-gray-100" />}>
              <SearchBar />
            </Suspense>
          </div>
        </section>

        {/* Recent */}
        <section className="mt-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                New
              </p>

              <h2 className="mt-1 text-lg font-semibold text-gray-900">
                Recently added
              </h2>
            </div>

            <Link
              href="/products"
              className="flex items-center gap-1 text-xs font-medium text-[#70765F]"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse"
                >
                  <div className="aspect-square rounded-2xl bg-gray-100" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-gray-100" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="rounded-2xl bg-[#F7F7F4] p-8 text-center">
              <p className="text-sm text-gray-400">
                No products available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4">
              {recentProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pinned */}
        {pinnedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                Curated
              </p>

              <h2 className="mt-1 text-lg font-semibold text-gray-900">
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

        {/* Collections shortcut */}
        <section className="mt-12 pb-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                Explore
              </p>

              <h2 className="mt-1 text-lg font-semibold text-gray-900">
                Collections
              </h2>
            </div>

            <Link
              href="/collections"
              className="flex items-center gap-1 text-xs font-medium text-[#70765F]"
            >
              See all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="rounded-2xl bg-[#F7F7F4] p-5 transition hover:bg-[#F1F1EC]"
              >
                <p className="text-sm font-medium text-gray-800">
                  {category.name}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Explore collection
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
