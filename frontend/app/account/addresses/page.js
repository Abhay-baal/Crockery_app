"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import BottomNav from "@/components/BottomNav";

const emptyAddress = { label: "Home", recipientName: "", phone: "", house: "", street: "", landmark: "", city: "", state: "", pincode: "", isDefault: false };

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login?redirect=%2Faccount%2Faddresses");
      return;
    }
    api.get("/account/addresses").then((response) => setAddresses(response.data.addresses || [])).catch((requestError) => setError(requestError.response?.data?.message || "Could not load addresses.")).finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setModalOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [modalOpen]);

  function openNew() { setEditingId(null); setForm(emptyAddress); setError(""); setModalOpen(true); }
  function openEdit(address) { setEditingId(address._id); setForm({ ...emptyAddress, ...address }); setError(""); setModalOpen(true); }
  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }

  async function saveAddress(event) {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const response = editingId ? await api.patch(`/account/addresses/${editingId}`, form) : await api.post("/account/addresses", form);
      setAddresses(response.data.addresses || []); setModalOpen(false);
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not save this address."); } finally { setSaving(false); }
  }

  async function removeAddress(address) {
    if (!window.confirm(`Delete this ${address.label} address?`)) return;
    try { const response = await api.delete(`/account/addresses/${address._id}`); setAddresses(response.data.addresses || []); } catch (requestError) { setError(requestError.response?.data?.message || "Could not delete this address."); }
  }

  async function makeDefault(address) {
    try { const response = await api.patch(`/account/addresses/${address._id}/default`); setAddresses(response.data.addresses || []); } catch (requestError) { setError(requestError.response?.data?.message || "Could not set the default address."); }
  }

  return <main className="min-h-screen bg-white pb-24 text-stone-900"><div className="mx-auto max-w-2xl px-5 sm:px-8">
    <header className="py-5"><Link href="/account" className="flex items-center gap-2 text-sm text-stone-500"><ArrowLeft size={17} /> Account</Link><h1 className="mt-6 text-2xl font-semibold tracking-tight">My Addresses</h1><p className="mt-1 text-sm text-stone-400">Manage your delivery addresses</p></header>
    {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {loading ? <div className="mt-8 h-36 animate-pulse rounded-2xl bg-stone-100" /> : addresses.length === 0 ? <div className="mt-8 rounded-2xl border border-stone-200 p-8 text-center"><MapPin className="mx-auto text-stone-400" /><p className="mt-3 text-sm text-stone-500">No saved addresses yet.</p></div> : <div className="mt-8 space-y-3">{addresses.map((address) => <article key={address._id} className="rounded-2xl border border-stone-200 p-5"><div className="flex items-center justify-between"><div className="flex gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><span>{address.label}</span>{address.isDefault && <span className="text-[#70765F]">Default</span>}</div>{!address.isDefault && <button type="button" onClick={() => makeDefault(address)} className="text-xs font-medium text-[#70765F]">Set default</button>}</div><p className="mt-4 text-sm font-semibold">{address.recipientName}</p><p className="mt-1 text-sm text-stone-600">{address.phone}</p><p className="mt-3 text-sm leading-6 text-stone-600">{address.house}, {address.street}{address.landmark ? `, ${address.landmark}` : ""}<br />{address.city}, {address.state} - {address.pincode}</p><div className="mt-4 flex gap-4"><button type="button" onClick={() => openEdit(address)} className="text-sm font-medium text-stone-700">Edit</button><button type="button" onClick={() => removeAddress(address)} className="text-sm font-medium text-red-600">Delete</button></div></article>)}</div>}
    <button type="button" onClick={openNew} className="mx-auto mt-8 flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white"><Plus size={17} /> Add Address</button>
  </div><BottomNav />
  {modalOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}><form onSubmit={saveAddress} role="dialog" aria-modal="true" aria-labelledby="address-dialog-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6"><div className="flex items-center justify-between"><h2 id="address-dialog-title" className="text-lg font-semibold">{editingId ? "Edit Address" : "Add Address"}</h2><button type="button" onClick={() => setModalOpen(false)} aria-label="Close address form" className="rounded-full p-2 text-stone-400 hover:bg-stone-100"><X size={18} /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{[["recipientName","Recipient name"],["phone","Phone number"],["house","House / building"],["street","Street / locality"],["landmark","Landmark (optional)"],["city","City"],["state","State"],["pincode","PIN code"]].map(([name,label]) => <label key={name} className="text-sm font-medium text-stone-700">{label}<input name={name} value={form[name]} onChange={updateField} required={!['landmark'].includes(name)} inputMode={name === 'pincode' || name === 'phone' ? 'tel' : 'text'} maxLength={name === 'pincode' ? 6 : undefined} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500" /></label>)}<label className="text-sm font-medium text-stone-700">Label<select name="label" value={form.label} onChange={updateField} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm"><option>Home</option><option>Work</option><option>Other</option></select></label><label className="flex items-center gap-2 self-end pb-3 text-sm text-stone-700"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} /> Make default</label></div>{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<div className="mt-6 flex gap-3"><button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-full border border-stone-200 px-4 py-3 text-sm">Cancel</button><button type="submit" disabled={saving} className="flex-1 rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Address"}</button></div></form></div>}
  </main>;
}
