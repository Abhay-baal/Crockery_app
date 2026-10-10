"use client";

import api from "../../services/api";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Lock, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useCart();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", recipientName: "", phone: "", house: "", street: "", landmark: "", city: "", state: "", pincode: "", isDefault: false });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login?redirect=/checkout");
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setForm((currentForm) => ({
          ...currentForm,
          fullName: parsedUser?.name || "",
          phone: parsedUser?.phone || "",
        }));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setCheckingAuth(false);

    api.get("/account/addresses")
      .then((response) => {
        const savedAddresses = response.data.addresses || [];
        setAddresses(savedAddresses);
        const defaultAddress = savedAddresses.find((address) => address.isDefault) || savedAddresses[0];
        if (defaultAddress) selectSavedAddress(defaultAddress);
      })
      .catch(() => {})
      .finally(() => setAddressLoading(false));
  }, [router]);

  useEffect(() => {
    if (!addressModalOpen) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setAddressModalOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [addressModalOpen]);

  function selectSavedAddress(address) {
    setSelectedAddressId(address._id);
    setForm((currentForm) => ({
      ...currentForm,
      fullName: address.recipientName,
      phone: address.phone,
      address: [address.house, address.street, address.landmark].filter(Boolean).join(", "),
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));
  }

  const updateNewAddress = (event) => setNewAddress({ ...newAddress, [event.target.name]: event.target.value });

  const saveCheckoutAddress = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/account/addresses", newAddress);
      const savedAddresses = response.data.addresses || [];
      setAddresses(savedAddresses);
      const created = response.data.address;
      if (created) selectSavedAddress(created);
      setAddressModalOpen(false);
    } catch (error) {
      window.alert(error.response?.data?.message || "Could not save this address.");
    }
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    setLoading(true);

    const orderId = `CB-${Date.now()}`;

    if (!form.fullName || !form.phone || !form.address || !form.city || !form.state || !/^\d{6}$/.test(form.pincode)) {
      window.alert("Please complete your delivery address, including a valid 6-digit PIN code.");
      return;
    }

    const selectedAddress = addresses.find((address) => address._id === selectedAddressId);
    const addressSnapshot = selectedAddress
      ? { ...selectedAddress }
      : { ...form, recipientName: form.fullName, fullAddress: form.address };
    const order = {
      id: orderId,
      orderId,
      customer: user,
      items: cartItems,
      total: cartTotal,
      address: form,
      addressSnapshot,
      status: "Pending",
      paymentStatus: "Pending",
      createdAt: new Date().toISOString(),
    };

    try {
      if (saveNewAddress && !selectedAddress) {
        await api.post("/account/addresses", { ...newAddress, recipientName: form.fullName, phone: form.phone, house: form.address, street: form.address, city: form.city, state: form.state, pincode: form.pincode });
      }
      const response = await api.post("/orders", order);

      const savedOrder = response.data?.order;

      localStorage.setItem(
        "last-order",
        JSON.stringify({
          ...order,
          orderId: response.data?.orderId || orderId,
          _id: savedOrder?._id,
        })
      );
    } catch (error) {
      console.error("Order save failed:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login?redirect=/checkout");
        return;
      }

      window.alert(
        error.response?.data?.message ||
        "Your order could not be saved. Please check your connection and try again."
      );
      setLoading(false);
      return;
    }

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
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">Saved delivery addresses</p>
                  <button type="button" onClick={() => setAddressModalOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-stone-700"><Plus size={14} /> Add new</button>
                </div>
                {addressLoading ? <div className="h-16 animate-pulse rounded-xl bg-stone-100" /> : addresses.length > 0 && <div className="space-y-2">{addresses.map((address) => <button key={address._id} type="button" onClick={() => selectSavedAddress(address)} className={`w-full rounded-xl border p-3 text-left ${selectedAddressId === address._id ? "border-stone-900 bg-stone-50" : "border-stone-200"}`}><span className="flex items-center gap-2 text-sm font-semibold"><span className={`flex h-4 w-4 items-center justify-center rounded-full border ${selectedAddressId === address._id ? "border-stone-900" : "border-stone-300"}`}>{selectedAddressId === address._id && <Check size={11} />}</span>{address.label}{address.isDefault && <span className="text-xs font-normal text-stone-500">· Default</span>}</span><span className="mt-1 block pl-6 text-xs text-stone-500">{address.recipientName} · {address.city}, {address.state} - {address.pincode}</span></button>)}</div>}
              </div>
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

              <label className="flex items-center gap-2 text-xs text-stone-500 sm:col-span-2"><input type="checkbox" checked={saveNewAddress} onChange={(event) => setSaveNewAddress(event.target.checked)} /> Save this custom address for next time</label>
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

      {addressModalOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center" onMouseDown={(event) => event.target === event.currentTarget && setAddressModalOpen(false)}><form onSubmit={saveCheckoutAddress} role="dialog" aria-modal="true" aria-labelledby="checkout-address-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6"><div className="flex items-center justify-between"><h2 id="checkout-address-title" className="text-lg font-semibold">Add New Address</h2><button type="button" onClick={() => setAddressModalOpen(false)} aria-label="Close address form" className="rounded-full p-2 text-stone-400 hover:bg-stone-100"><X size={18} /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{[["recipientName","Recipient name"],["phone","Phone number"],["house","House / building"],["street","Street / locality"],["landmark","Landmark (optional)"],["city","City"],["state","State"],["pincode","PIN code"]].map(([name,label]) => <label key={name} className="text-sm font-medium text-stone-700">{label}<input name={name} value={newAddress[name]} onChange={updateNewAddress} required={name !== "landmark"} maxLength={name === "pincode" ? 6 : undefined} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500" /></label>)}</div><div className="mt-6 flex gap-3"><button type="button" onClick={() => setAddressModalOpen(false)} className="flex-1 rounded-full border border-stone-200 px-4 py-3 text-sm">Cancel</button><button type="submit" className="flex-1 rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white">Save Address</button></div></form></div>}
    </main>
  );
}
