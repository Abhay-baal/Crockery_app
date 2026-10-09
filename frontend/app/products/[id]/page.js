"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import api from "@/services/api";
import { useCart } from "@/context/CartContext";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const { addToCart, cartCount } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { id } = await params;
        const response = await api.get(`/products/${id}`);

        setProduct(response.data.product);
      } catch (error) {
        console.error("Failed to load product:", error);
        setError("Product could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-sm text-stone-500">Loading product...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-5">
        <p className="text-stone-600">{error || "Product not found."}</p>

        <Link
          href="/home"
          className="mt-5 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to store
        </Link>
      </main>
    );
  }

  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link
            href="/home"
            className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
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

      <section className="mx-auto max-w-6xl px-5 py-8 md:py-14">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-stone-100 text-8xl">
            {product.images?.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              "🍽️"
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium text-stone-500">
              {product.category?.name}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              {product.name}
            </h1>

            <p className="mt-5 leading-7 text-stone-600">
              {product.description}
            </p>

            <div className="mt-7 flex items-end gap-3">
              <span className="text-3xl font-bold">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              {product.mrp > product.price && (
                <>
                  <span className="text-lg text-stone-400 line-through">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>

                  <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="mt-5">
              {product.stock > 0 ? (
                <p className="text-sm font-medium text-green-700">
                  ✓ In stock ({product.stock} available)
                </p>
              ) : (
                <p className="text-sm font-medium text-red-600">
                  Out of stock
                </p>
              )}
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium">Quantity</p>

              <div className="flex w-fit items-center rounded-full border border-stone-300 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-stone-100"
                >
                  <Minus size={16} />
                </button>

                <span className="w-10 text-center text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  disabled={quantity >= product.stock}
                  className="p-3 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <ShoppingBag size={18} />

              {added ? "Added to cart ✓" : "Add to cart"}
            </button>

            <div className="mt-8 border-t border-stone-200 pt-6 text-sm text-stone-500">
              <p>SKU: {product.sku || "Not available"}</p>

              <p className="mt-2">
                Category: {product.category?.name || "Uncategorized"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
