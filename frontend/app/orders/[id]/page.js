"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Package, Truck } from "lucide-react";
import { useParams } from "next/navigation";
import api from "../../../services/api";
import BottomNav from "../../../components/BottomNav";

const statuses = [
  "Pending",
  "Accepted",
  "Processing",
  "Shipped",
  "Delivered",
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const dateLabel = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
};

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function loadOrder() {
      try {
        if (!localStorage.getItem("token")) {
          window.location.assign(
            `/login?redirect=${encodeURIComponent(`/orders/${id}`)}`
          );
          return;
        }

        const response = await api.get(
          `/orders/${encodeURIComponent(id)}`
        );

        if (active) setOrder(response.data?.order || null);
      } catch (err) {
        if (active) {
          setError(
            err.response?.status === 404
              ? "We couldn't find this order in your account."
              : err.response?.status === 401
                ? "Your session has expired. Please log in again."
                : "We couldn't load this order. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  const status = order?.status || "Pending";
  const cancelled = status === "Cancelled";
  const currentIndex = statuses.indexOf(status);
  const items = Array.isArray(order?.payload?.items)
    ? order.payload.items
    : [];

  return (
    <main className="min-h-screen bg-white pb-24 text-gray-900">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <header className="flex items-center gap-3 py-6">
          <Link
            href="/orders"
            aria-label="Back to orders"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Order details</h1>
            <p className="mt-1 text-sm text-gray-500">
              Your order and delivery information
            </p>
          </div>
        </header>

        {loading ? (
          <div className="animate-pulse rounded-2xl border border-black/5 p-6">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="mt-5 h-20 rounded bg-gray-100" />
          </div>
        ) : error ? (
          <section className="rounded-2xl border border-black/5 p-6">
            <p className="text-sm text-gray-600">{error}</p>
            <Link href="/orders" className="mt-4 inline-block text-sm font-medium text-[#70765F]">
              Return to orders
            </Link>
          </section>
        ) : order ? (
          <div className="space-y-5">
            <section className="rounded-2xl border border-black/10 p-5">
              <p className="text-xs text-gray-500">Order number</p>
              <h2 className="mt-1 text-lg font-semibold">
                {order.orderId || String(order._id).slice(-6)}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Placed {dateLabel(order.createdAt)}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-[#F7F7F4] px-3 py-1.5 text-sm font-medium">
                  {status}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 p-5">
              <h2 className="text-base font-semibold">Order progress</h2>

              {cancelled ? (
                <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  This order has been cancelled.
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  {statuses.map((step, index) => {
                    const complete = currentIndex >= index;
                    const active = currentIndex === index;

                    return (
                      <div key={step} className="flex gap-3">
                        <div className="flex w-6 shrink-0 justify-center">
                          {complete ? (
                            <CheckCircle2
                              size={21}
                              className="text-[#70765F]"
                            />
                          ) : (
                            <Circle size={21} className="text-gray-300" />
                          )}
                        </div>

                        <div>
                          <p className={`text-sm font-medium ${
                            active ? "text-gray-900" :
                            complete ? "text-gray-700" : "text-gray-400"
                          }`}>
                            {step}
                          </p>
                          {active && (
                            <p className="mt-1 text-xs text-gray-500">
                              Current order status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="mt-5 border-t border-black/5 pt-4 text-xs leading-5 text-gray-500">
                Status updates reflect the latest status saved by the store.
                Delivery dates are shown only when available from the order data.
              </p>
            </section>

            <section className="rounded-2xl border border-black/10 p-5">
              <h2 className="text-base font-semibold">Products ordered</h2>

              {items.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  Product details are unavailable for this order.
                </p>
              ) : (
                <div className="mt-4 divide-y divide-black/5">
                  {items.map((item, index) => {
                    const name =
                      item.name ||
                      item.title ||
                      item.productName ||
                      item.product?.name ||
                      "Crockery product";

                    const quantity =
                      Number(item.quantity ?? item.qty ?? 1) || 1;

                    const price =
                      Number(item.price ?? item.product?.price ?? 0) || 0;

                    const image =
                      item.image ||
                      item.imageUrl ||
                      item.product?.image ||
                      item.images?.[0] ||
                      item.product?.images?.[0];

                    return (
                      <div
                        key={item._id || item.id || index}
                        className="flex items-center gap-3 py-4"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F7F7F4]">
                          {image ? (
                            <img src={image} alt={name} className="h-full w-full object-cover" />
                          ) : (
                            <Package size={22} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{name}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            Quantity: {quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {money(price * quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-black/5 pt-4">
                <span className="text-sm text-gray-500">Order total</span>
                <span className="text-lg font-semibold">
                  {money(order.payload?.total ?? order.payload?.cartTotal)}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 p-5">
              <h2 className="text-base font-semibold">Delivery address</h2>
              <div className="mt-3 text-sm leading-6 text-gray-600">
                <p>{order.payload?.address?.fullName || order.payload?.customer?.name || "Customer"}</p>
                {order.payload?.address?.phone && <p>{order.payload.address.phone}</p>}
                <p>
                  {[
                    order.payload?.address?.address,
                    order.payload?.address?.city,
                    order.payload?.address?.state,
                    order.payload?.address?.pincode,
                  ].filter(Boolean).join(", ") || "Address unavailable"}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 p-5">
              <h2 className="text-base font-semibold">Payment</h2>
              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span className="text-gray-500">Payment status</span>
                <span>{order.payload?.paymentStatus || "Not available"}</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Online payment is not confirmed unless your payment integration verifies it.
              </p>
            </section>

            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#70765F]"
            >
              <Truck size={17} />
              Back to all orders
            </Link>
          </div>
        ) : null}
      </div>

      <BottomNav />
    </main>
  );
}
