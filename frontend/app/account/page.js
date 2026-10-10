"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import api from "../../services/api";
import BottomNav from "../../components/BottomNav";

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

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
            setProfileForm({ name: profile.name || "", phone: profile.phone || "" });
          }
        } catch {
          // Existing token/user can still be used.
        }

        try {
          const token = localStorage.getItem("token");

          if (!token) {
            router.replace("/login?redirect=%2Faccount");
            return;
          }

          const response = await api.get("/orders");
          const orderData = response.data?.orders || [];

          setOrders(
            Array.isArray(orderData)
              ? orderData.slice(0, 3)
              : []
          );
        } catch (error) {
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.replace("/login?redirect=%2Faccount");
            return;
          }

          setOrdersError(
            "We couldn't load your orders. Please try again."
          );
        }
      } catch (error) {
        console.error("Account error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setProfileOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [profileOpen]);

  function openProfile() {
    setProfileForm({ name: user?.name || "", phone: user?.phone || "" });
    setProfileMessage("");
    setProfileError("");
    setProfileOpen(true);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileMessage("");
    try {
      const response = await api.patch("/auth/me", profileForm);
      const nextUser = response.data.user;
      setUser(nextUser);
      localStorage.setItem("user", JSON.stringify(nextUser));
      setProfileMessage("Your details were saved.");
    } catch (error) {
      setProfileError(error.response?.data?.message || "Could not save your details.");
    } finally {
      setProfileSaving(false);
    }
  }

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

          {loading ? (
            <div className="animate-pulse rounded-2xl border border-black/5 p-5">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-48 rounded bg-gray-100" />
            </div>
          ) : ordersError ? (
            <div className="rounded-2xl border border-red-100 p-5">
              <p className="text-sm text-red-700">{ordersError}</p>
              <Link href="/orders" className="mt-3 inline-block text-sm font-medium text-[#70765F]">
                Open orders
              </Link>
            </div>
          ) : orders.length === 0 ? (
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
                      Order #{order.orderId || String(order._id).slice(-6)}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {Array.isArray(order.payload?.items)
                        ? `${order.payload.items.length} product${order.payload.items.length === 1 ? "" : "s"} · `
                        : ""}
                      {order.status || "Pending"}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
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
              onClick={openProfile}
            />

            <AccountLink
              icon={<Heart size={18} />}
              label="Liked Products"
              href="/account/saved"
            />

            <AccountLink
              icon={<MapPin size={18} />}
              label="Addresses"
              href="/account/addresses"
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

      {profileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setProfileOpen(false)}
        >
          <form
            onSubmit={saveProfile}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-dialog-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="profile-dialog-title" className="text-lg font-semibold text-gray-900">Personal Details</h2>
              <button type="button" onClick={() => setProfileOpen(false)} aria-label="Close personal details" className="rounded-full p-2 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <label className="mt-6 block text-sm font-medium text-gray-700">Full name<input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} required className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-500" /></label>
            <label className="mt-4 block text-sm font-medium text-gray-700">Email address<input value={user?.email || ""} readOnly className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-500 outline-none" /></label>
            <label className="mt-4 block text-sm font-medium text-gray-700">Phone number<input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} placeholder="Enter phone number" className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-500" /></label>
            {profileError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{profileError}</p>}
            {profileMessage && <p role="status" className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{profileMessage}</p>}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setProfileOpen(false)} className="flex-1 rounded-full border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700">Cancel</button>
              <button type="submit" disabled={profileSaving} className="flex-1 rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{profileSaving ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function AccountLink({ icon, label, href, onClick }) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <ChevronRight size={17} className="text-gray-300" />
    </>
  );

  if (onClick) {
    return <button type="button" onClick={onClick} className="flex w-full items-center justify-between border-b border-black/5 px-4 py-4 text-left last:border-b-0">{content}</button>;
  }

  return (
    <Link href={href}
      className="flex items-center justify-between border-b border-black/5 px-4 py-4 last:border-b-0"
    >
      {content}
    </Link>
  );
}
