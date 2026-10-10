"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, RefreshCw, ShoppingBag } from "lucide-react";
import api from "../../services/api";
import BottomNav from "../../components/BottomNav";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const dateLabel = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const statusStyle = {
  Pending: "bg-amber-50 text-amber-700",
  Accepted: "bg-blue-50 text-blue-700",
  Processing: "bg-blue-50 text-blue-700",
  Shipped: "bg-violet-50 text-violet-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

function getItems(order) {
  return Array.isArray(order?.payload?.items)
    ? order.payload.items
    : [];
}

function getItemName(item) {
  return (
    item.name ||
    item.title ||
    item.productName ||
    item.product?.name ||
    "Crockery product"
  );
}

function getItemImage(item) {
  return (
    item.image ||
    item.imageUrl ||
    item.product?.image ||
    item.images?.[0] ||
    item.product?.images?.[0] ||
    ""
  );
}

function getQuantity(item) {
  return Number(item.quantity ?? item.qty ?? 1) || 1;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      if (!localStorage.getItem("token")) {
        window.location.assign("/login?redirect=/orders");
        return;
      }

      const response = await api.get("/orders");
      setOrders(
        Array.isArray(response.data?.orders)
          ? response.data.orders
          : []
      );
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.assign("/login?redirect=/orders");
        return;
      }

      setError(
        err.response?.data?.message ||
          "We couldn't load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-white pb-24 text-gray-900">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <header className="flex items-center gap-3 py-6">
          <Link
            href="/account"
            aria-label="Back to account"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              My orders
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Your order history and delivery updates
            </p>
          </div>
        </header>

        {loading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-black/5 p-5"
              >
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="mt-4 h-16 rounded bg-gray-100" />
                <div className="mt-4 h-3 w-24 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <section className="rounded-2xl border border-red-100 p-6">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={loadOrders}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </section>
        ) : orders.length === 0 ? (
          <section className="flex flex-col items-center rounded-2xl border border-black/5 px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F7F4] text-[#70765F]">
              <ShoppingBag size={27} strokeWidth={1.5} />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              No orders yet
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Once you place an order, your products and delivery updates will appear here.
            </p>

            <Link
              href="/home"
              className="mt-6 rounded-xl bg-[#70765F] px-5 py-3 text-sm font-medium text-white"
            >
              Explore products
            </Link>
          </section>
        ) : (
          <section className="space-y-4">
            <p className="text-sm text-gray-500">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>

            {orders.map((order) => {
              const items = getItems(order);
              const status = order.status || "Pending";

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-black/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/5 bg-[#FAFAF8] px-4 py-4 sm:px-5">
                    <div>
                      <p className="text-sm font-semibold">
                        Order #{order.orderId || String(order._id).slice(-6)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Placed on {dateLabel(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        statusStyle[status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    {items.slice(0, 3).map((item, index) => {
                      const image = getItemImage(item);

                      return (
                        <div
                          key={item._id || item.id || `${order._id}-${index}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F7F7F4]">
                            {image ? (
                              <img
                                src={image}
                                alt={getItemName(item)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={22} className="text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium">
                              {getItemName(item)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Qty: {getQuantity(item)}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-medium">
                            {money(
                              (item.price ?? item.product?.price ?? 0) *
                              getQuantity(item)
                            )}
                          </p>
                        </div>
                      );
                    })}

                    {items.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{items.length - 3} more{" "}
                        {items.length - 3 === 1 ? "item" : "items"}
                      </p>
                    )}

                    <div className="flex items-center justify-between border-t border-black/5 pt-4">
                      <div>
                        <p className="text-xs text-gray-500">Order total</p>
                        <p className="mt-1 text-base font-semibold">
                          {money(order.payload?.total ?? order.payload?.cartTotal)}
                        </p>
                      </div>

                      <Link
                        href={`/orders/${order._id}`}
                        className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
