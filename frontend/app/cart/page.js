"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-stone-50 text-stone-900">
        <header className="border-b border-stone-200 bg-stone-50">
          <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
            <Link
              href="/home"
              className="flex items-center gap-2 text-sm font-medium text-stone-600"
            >
              <ArrowLeft size={18} />
              Back to store
            </Link>
          </div>
        </header>

        <section className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
            🛒
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Add something beautiful to your table.
          </p>

          <Link
            href="/home"
            className="mt-7 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Start shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Link
              href="/home"
            className="flex items-center gap-2 text-sm font-medium text-stone-600"
          >
            <ArrowLeft size={18} />
            Continue shopping
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-sm font-medium text-stone-500">
          YOUR BAG
        </p>

        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Shopping cart
          </h1>

          <span className="text-sm text-stone-500">
            {cartItems.reduce(
              (total, item) => total + item.quantity,
              0
            )}{" "}
            items
          </span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cartItems.map((item) => {
              const lineTotal = item.price * item.quantity;

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-stone-200 bg-white p-4"
                >
                  <div className="flex gap-4">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-4xl">
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

                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-stone-300 bg-stone-50">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="w-10 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= item.stock}
                            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeFromCart(item._id)
                          }
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
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

          <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-bold">
              Order summary
            </h2>

            <div className="mt-6 flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>

              <span>
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-3 flex justify-between text-sm text-stone-600">
              <span>Delivery</span>

              <span>Calculated at checkout</span>
            </div>

            <div className="my-6 border-t border-stone-200" />

            <div className="flex justify-between">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-xl font-bold">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-4 text-sm font-semibold text-white hover:bg-stone-700"
            >
              <ShoppingBag size={18} />
              Proceed to checkout
            </Link>

            <p className="mt-3 text-center text-xs text-stone-400">
              Secure checkout
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
