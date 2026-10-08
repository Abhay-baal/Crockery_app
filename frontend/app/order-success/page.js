"use client";

import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";

function getSavedOrder() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedOrder = localStorage.getItem("last-order");

    return savedOrder ? JSON.parse(savedOrder) : null;
  } catch {
    return null;
  }
}

export default function OrderSuccessPage() {
  const order = getSavedOrder();

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900">
            No recent order found
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Your order information is not available.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Back to store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-stone-900">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={36} />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Order placed successfully
          </h1>

          <p className="mt-3 text-sm leading-6 text-stone-500">
            Thank you for shopping with Magotra Bartan Store. Your order has
            been received successfully.
          </p>

          <div className="mt-8 rounded-2xl bg-stone-50 p-5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500">Order ID</span>
              <span className="text-sm font-semibold">
                {order.orderId || "CB-ORDER"}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-stone-500">Total</span>
              <span className="text-lg font-bold">
                ₹{Number(order.total || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            <ShoppingBag size={18} />
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
