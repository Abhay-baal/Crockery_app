"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import api from "@/services/api";
import { useCart } from "@/context/CartContext";

export default function CategoryPage({ params }) {
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { cartCount } = useCart();

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const { slug } = await params;

        const [categoriesResponse, productsResponse] =
          await Promise.all([
            api.get("/categories"),
            api.get("/products"),
          ]);

        const foundCategory =
          categoriesResponse.data.categories.find(
            (item) => item.slug === slug
          );

        if (!foundCategory) {
          setError("Category not found.");
          return;
        }

        setCategory(foundCategory);

        const filteredProducts =
          productsResponse.data.products.filter(
            (product) =>
              product.category?.slug === foundCategory.slug
          );

        setProducts(filteredProducts);
      } catch (error) {
        console.error("Category error:", error);
        setError("Unable to load this category.");
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-sm text-stone-500">
          Loading products...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50">
        <p className="text-stone-600">{error}</p>

        <Link
          href="/"
          className="mt-5 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to store
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-stone-600"
          >
            <ArrowLeft size={18} />
            Back to store
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm"
          >
            <ShoppingBag size={17} />
            Cart

            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-sm font-medium text-stone-500">
          COLLECTION
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          {category.name}
        </h1>

        {category.description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
            {category.description}
          </p>
        )}

        <div className="mt-10">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
              <p className="text-stone-500">
                No products available in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => {
                const discount =
                  product.mrp > product.price
                    ? Math.round(
                        ((product.mrp - product.price) /
                          product.mrp) *
                          100
                      )
                    : 0;

                return (
                  <Link
                    href={`/products/${product._id}`}
                    key={product._id}
                    className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex aspect-square items-center justify-center overflow-hidden bg-stone-100 text-6xl">
                      {product.images?.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        "🍽️"
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-stone-500">
                        {product.category?.name}
                      </p>

                      <h2 className="mt-1 line-clamp-2 text-sm font-semibold">
                        {product.name}
                      </h2>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="font-bold">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>

                        {product.mrp > product.price && (
                          <span className="text-xs text-stone-400 line-through">
                            ₹{product.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {discount > 0 && (
                        <p className="mt-2 text-xs font-semibold text-green-700">
                          {discount}% OFF
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
