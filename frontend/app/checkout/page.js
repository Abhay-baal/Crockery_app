"use client";

import api from "../../services/api";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useCart();

  const [checkingAuth] = useState(
    () => typeof window !== "undefined" && !localStorage.getItem("token")
  );
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;

    const savedUser = localStorage.getItem("user");

    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login?redirect=/checkout");
      return;
    }

  }, [router]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    setLoading(true);

    const order = {
      id: `CB-${Date.now()}`,
      customer: user,
      items: cartItems,
      total: cartTotal,
      address: form,
      status: "Pending",
      paymentStatus: "Pending",
      createdAt: new Date().toISOString(),
    };

    try {
      await api.post("/orders", order);
    } catch (error) {
      console.error("Order save failed:", error);
      window.alert("Your order could not be saved. Please check your connection and try again.");
      return;
    }

    localStorage.setItem(
      "last-order",
      JSON.stringify(order)
    );

    clearCart();

    router.push("/order-success");
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-sm text-stone-500">
          Checking account...
        </p>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
          🛒
        </div>

        <h1 className="mt-6 text-2xl font-bold">
          Your cart is empty
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Add products before checking out.
        </p>

        <Link
          href="/home"
          className="mt-6 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm text-stone-600"
          >
            <ArrowLeft size={18} />
            Back to cart
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div>
          <p className="text-sm font-medium text-stone-500">
            CHECKOUT
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Complete your order
          </h1>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={handlePlaceOrder}
            className="rounded-2xl border border-stone-200 bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
                1
              </div>

              <div>
                <h2 className="font-bold">
                  Delivery address
                </h2>

                <p className="text-xs text-stone-500">
                  Where should we deliver your order?
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Full name
                </label>

                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Phone number
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  PIN code
                </label>

                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Full address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="House / Flat, Street, Area"
                  className="mt-2 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  City
                </label>

                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  State
                </label>

                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-500"
                />
              </div>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-stone-50 p-4">
              <Lock
                size={17}
                className="mt-0.5 text-stone-500"
              />

              <div>
                <p className="text-sm font-semibold">
                  Secure checkout
                </p>

                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Your order information is kept secure.
                  Online payment will be connected next.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-full bg-stone-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-50"
            >
              {loading
                ? "Placing order..."
                : `Place order · ₹${cartTotal.toLocaleString(
                    "en-IN"
                  )}`}
            </button>
          </form>

          <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-bold">
              Your order
            </h2>

            <div className="mt-5 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹
                    {(item.price * item.quantity).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-stone-200" />

            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span>
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-3 flex justify-between text-sm text-stone-600">
              <span>Delivery</span>
              <span>Free</span>
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
          </aside>
        </div>
      </section>
    </main>
  );
}
