"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import api from "@/services/api";

export default function CartPage() {
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const [likedProducts, setLikedProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState("");
  const [wishlistNotice, setWishlistNotice] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [addingId, setAddingId] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLikedProducts() {
      if (!localStorage.getItem("token")) {
        setLoginRequired(true);
        setWishlistLoading(false);
        return;
      }

      try {
        const response = await api.get("/account/wishlist");

        if (!cancelled) {
          setLikedProducts(response.data.products || []);
        }
      } catch (error) {
        if (!cancelled) {
          setWishlistError(
            error.response?.data?.message ||
              "Could not load your liked products."
          );
        }
      } finally {
        if (!cancelled) setWishlistLoading(false);
      }
    }

    loadLikedProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemoveLiked(productId) {
    setRemovingId(productId);
    setWishlistError("");
    setWishlistNotice("");

    try {
      await api.delete(`/account/wishlist/${productId}`);

      setLikedProducts((current) =>
        current.filter((product) => product._id !== productId)
      );
      setWishlistNotice("Product removed from liked products.");
    } catch (error) {
      setWishlistError(
        error.response?.data?.message ||
          "Could not remove this liked product."
      );
    } finally {
      setRemovingId("");
    }
  }

  function handleAddLikedProduct(product) {
    if (product.stock <= 0) {
      setWishlistNotice("This product is currently out of stock.");
      return;
    }

    addToCart(product, 1);
    setAddingId(product._id);
    setWishlistNotice(`${product.name} added to your cart.`);

    window.setTimeout(() => setAddingId(""), 1200);
  }

  const itemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Link
            href="/home"
            className="flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-stone-900"
          >
            <ArrowLeft size={18} />
            Continue shopping
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <p className="text-sm font-medium text-stone-500">YOUR BAG</p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Shopping cart
          </h1>

          <span className="shrink-0 text-sm text-stone-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white px-5 py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-stone-700">
              <ShoppingBag size={28} strokeWidth={1.5} />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Add a product from your liked list below or explore the store.
            </p>

            <Link
              href="/products"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              Explore products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const lineTotal = item.price * item.quantity;

                return (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-stone-200 bg-white p-4"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-3xl sm:h-28 sm:w-28">
                        {item.images?.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          "🍽️"
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-stone-500">
                          {item.category?.name}
                        </p>

                        <h2 className="mt-1 font-semibold">
                          {item.name}
                        </h2>

                        <p className="mt-2 text-sm text-stone-500">
                          ₹{item.price.toLocaleString("en-IN")} each
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center rounded-full border border-stone-300 bg-stone-50">
                            <button
                              type="button"
                              aria-label={`Decrease ${item.name} quantity`}
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={`Increase ${item.name} quantity`}
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item._id)}
                            className="flex items-center gap-1 text-xs text-red-500 transition hover:text-red-700"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="hidden text-right sm:block">
                        <p className="text-lg font-bold">
                          ₹{lineTotal.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 sm:hidden">
                      <span className="text-sm text-stone-500">
                        {item.quantity} × ₹
                        {item.price.toLocaleString("en-IN")}
                      </span>

                      <span className="font-bold">
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-bold">Order summary</h2>

              <div className="mt-6 flex justify-between text-sm text-stone-600">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="mt-3 flex justify-between gap-3 text-sm text-stone-600">
                <span>Delivery</span>
                <span className="text-right">Calculated at checkout</span>
              </div>

              <div className="my-6 border-t border-stone-200" />

              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                <ShoppingBag size={18} />
                Proceed to checkout
              </Link>

              <p className="mt-3 text-center text-xs text-stone-400">
                Secure checkout
              </p>
            </aside>
          </div>
        )}

        <section className="mt-12 border-t border-stone-200 pt-8 sm:mt-14 sm:pt-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                SAVED FOR LATER
              </p>
              <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                Liked products
              </h2>
            </div>

            <Heart size={22} strokeWidth={1.7} className="shrink-0 text-stone-700" />
          </div>

          {wishlistNotice && (
            <p role="status" className="mt-4 text-sm text-stone-600">
              {wishlistNotice}
            </p>
          )}

          {wishlistError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {wishlistError}
            </p>
          )}

          {wishlistLoading ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-stone-200/60"
                />
              ))}
            </div>
          ) : loginRequired ? (
            <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-6 text-center">
              <p className="text-sm text-stone-600">
                Sign in to see your liked products.
              </p>
              <Link
                href="/login?redirect=%2Fcart"
                className="mt-4 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700"
              >
                Sign in
              </Link>
            </div>
          ) : likedProducts.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-6 text-center">
              <Heart size={25} className="mx-auto text-stone-400" strokeWidth={1.5} />
              <p className="mt-3 font-semibold">No liked products yet</p>
              <p className="mt-1 text-sm text-stone-500">
                Tap the heart on a product to save it here.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-flex rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold transition hover:bg-stone-100"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {likedProducts.map((product) => {
                const alreadyInCart = cartItems.some(
                  (item) => item._id === product._id
                );
                const outOfStock = product.stock <= 0;

                return (
                  <article
                    key={product._id}
                    className="flex min-w-0 gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:gap-4 sm:p-4"
                  >
                    <Link
                      href={`/products/${product._id}`}
                      aria-label={`View ${product.name}`}
                      className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 sm:h-28 sm:w-28"
                    >
                      {product.images?.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🍽️</span>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col items-start">
                      <p className="text-xs text-stone-500">
                        {product.category?.name || "Crockery"}
                      </p>

                      <Link
                        href={`/products/${product._id}`}
                        className="mt-1 line-clamp-2 font-semibold hover:text-stone-600"
                      >
                        {product.name}
                      </Link>

                      <p className="mt-2 font-semibold">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                      </p>

                      <div className="mt-auto flex w-full flex-wrap items-center gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => handleAddLikedProduct(product)}
                          disabled={outOfStock || addingId === product._id}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-stone-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300 sm:px-4"
                        >
                          <Plus size={14} />
                          {outOfStock
                            ? "Out of stock"
                            : alreadyInCart
                              ? "Add another"
                              : addingId === product._id
                                ? "Added"
                                : "Add to cart"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveLiked(product._id)}
                          disabled={removingId === product._id}
                          aria-label={`Remove ${product.name} from liked products`}
                          className="text-xs text-stone-500 underline underline-offset-2 transition hover:text-red-600 disabled:opacity-50"
                        >
                          {removingId === product._id ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
