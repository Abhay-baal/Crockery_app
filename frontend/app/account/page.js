"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import api from "../../services/api";
import BottomNav from "../../components/BottomNav";

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      try {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            console.log("Could not parse saved user");
          }
        }

        try {
          const response = await api.get("/auth/me");

          const profile =
            response.data?.user ||
            response.data;

          if (profile) {
            setUser(profile);
          }
        } catch {
          // Existing token/user can still be used.
        }

        try {
          const response = await api.get("/orders");

          const orderData =
            response.data?.orders ||
            response.data ||
            [];

          setOrders(
            Array.isArray(orderData)
              ? orderData.slice(0, 3)
              : []
          );
        } catch {
          setOrders([]);
        }
      } catch (error) {
        console.error("Account error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">

        <header className="py-5">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Account
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Your profile and orders
          </p>
        </header>

        <section className="mt-3 rounded-2xl bg-[#F7F7F4] p-5">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#70765F]">
              <User size={22} strokeWidth={1.6} />
            </div>

            <div className="min-w-0">
              {loading ? (
                <>
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-200" />
                </>
              ) : (
                <>
                  <h2 className="truncate text-sm font-semibold text-gray-900">
                    {user?.name ||
                      user?.fullName ||
                      "Crockery Customer"}
                  </h2>

                  <p className="mt-1 truncate text-xs text-gray-400">
                    {user?.email || "Manage your account details"}
                  </p>
                </>
              )}
            </div>

          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Orders
            </h2>

            <Link
              href="/orders"
              className="text-xs font-medium text-[#70765F]"
            >
              View all
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-black/5 p-5">
              <div className="flex items-center gap-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F7F4]">
                  <Package
                    size={19}
                    strokeWidth={1.5}
                    className="text-[#70765F]"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    No orders yet
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Your orders will appear here.
                  </p>
                </div>

              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="flex items-center justify-between rounded-2xl border border-black/5 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Order #{String(order._id).slice(-6)}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {order.status || "Processing"}
                    </p>
                  </div>

                  <ChevronRight
                    size={17}
                    className="text-gray-300"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Account
          </h2>

          <div className="overflow-hidden rounded-2xl border border-black/5">

            <AccountLink
              icon={<User size={18} />}
              label="Personal details"
              href="/account/profile"
            />

            <AccountLink
              icon={<Heart size={18} />}
              label="Saved products"
              href="/account/saved"
            />

            <AccountLink
              icon={<MapPin size={18} />}
              label="Addresses"
              href="/account/addresses"
            />

            <AccountLink
              icon={<Settings size={18} />}
              label="Settings"
              href="/account/settings"
            />

          </div>
        </section>

        <button
          onClick={logout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/5 py-3.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
        >
          <LogOut size={17} strokeWidth={1.7} />
          Log out
        </button>

        <p className="pb-5 pt-8 text-center text-[11px] text-gray-300">
          Crockery
        </p>

      </div>

      <BottomNav />
    </main>
  );
}

function AccountLink({ icon, label, href }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-black/5 px-4 py-4 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-400">
          {icon}
        </span>

        <span className="text-sm text-gray-700">
          {label}
        </span>
      </div>

      <ChevronRight
        size={17}
        className="text-gray-300"
      />
    </Link>
  );
}
