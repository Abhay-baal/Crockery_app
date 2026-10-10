"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import BottomNav from "@/components/BottomNav";

export default function SavedProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.replace("/login?redirect=%2Faccount%2Fsaved"); return; }
    api.get("/account/wishlist").then((response) => setProducts(response.data.products || [])).catch((requestError) => setError(requestError.response?.data?.message || "Could not load liked products.")).finally(() => setLoading(false));
  }, [router]);

  async function unlike(productId) {
    try { await api.delete(`/account/wishlist/${productId}`); setProducts((current) => current.filter((product) => product._id !== productId)); } catch (requestError) { setError(requestError.response?.data?.message || "Could not remove product."); }
  }

  return <main className="min-h-screen bg-white pb-24 text-stone-900"><div className="mx-auto max-w-4xl px-5 sm:px-8"><header className="py-5"><Link href="/home" className="flex items-center gap-2 text-sm text-stone-500"><ArrowLeft size={17} /> Account</Link><h1 className="mt-6 text-2xl font-semibold tracking-tight">Liked Products</h1><p className="mt-1 text-sm text-stone-400">Products you&apos;ve saved</p></header>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{loading ? <div className="mt-8 grid grid-cols-2 gap-4"><div className="aspect-square animate-pulse rounded-2xl bg-stone-100" /><div className="aspect-square animate-pulse rounded-2xl bg-stone-100" /></div> : products.length === 0 ? <div className="mt-8 rounded-2xl border border-stone-200 p-10 text-center"><Heart className="mx-auto text-stone-400" /><p className="mt-3 text-sm text-stone-500">You haven&apos;t liked any products yet.</p><Link href="/products" className="mt-5 inline-block rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Explore products</Link></div> : <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">{products.map((product) => <article key={product._id} className="relative"><Link href={`/products/${product._id}`} className="block"><div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#F5F5F1]">{product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" /> : <ShoppingBag className="text-[#7A8068]" />}</div><h2 className="mt-3 line-clamp-1 text-sm font-medium">{product.name}</h2><p className="mt-2 text-sm text-[#6F755F]">₹{Number(product.price || 0).toLocaleString("en-IN")}</p></Link><button type="button" onClick={() => unlike(product._id)} aria-label={`Unlike ${product.name}`} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm"><Heart size={17} fill="currentColor" /></button></article>)}</div>}</div><BottomNav /></main>;
}
