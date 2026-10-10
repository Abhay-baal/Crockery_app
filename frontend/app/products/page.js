"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import api from "../../services/api";
import BottomNav from "../../components/BottomNav";
import SearchBar from "../../components/SearchBar";
import ProductCard from "../../components/ProductCard";

import PageShortcuts from "../../components/PageShortcuts";
function ProductsPageContent() {
  const searchParams = useSearchParams();

  const search = (
    searchParams.get("search") || ""
  ).toLowerCase().trim();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
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
          Array.isArray(productData)
            ? productData
            : []
        );

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : []
        );
      } catch (error) {
        console.error("Products error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !search ||
      product.name?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search) ||
      product.category?.name?.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category?._id === selectedCategory ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">


        <section className="pb-5 pt-2">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
            Catalogue
          </p>

          <div className="flex items-center justify-between gap-3">
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">Products</h1>
            <PageShortcuts />
          </div>

          <div className="mt-5">
            <SearchBar />
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-7 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs transition ${
                selectedCategory === "all"
                  ? "bg-[#70765F] text-white"
                  : "bg-[#F5F5F1] text-gray-500"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() =>
                  setSelectedCategory(category._id)
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs transition ${
                  selectedCategory === category._id
                    ? "bg-[#70765F] text-white"
                    : "bg-[#F5F5F1] text-gray-500"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
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
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl bg-[#F7F7F4] p-10 text-center">
            <p className="text-sm font-medium text-gray-600">
              No products found
            </p>

            {search && (
              <p className="mt-2 text-xs text-gray-400">
                Try searching for something else.
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="mb-5 text-xs text-gray-400">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white pb-24">
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
            <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
            <div className="mt-6 h-12 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
