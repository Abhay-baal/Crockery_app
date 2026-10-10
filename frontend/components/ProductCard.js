"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import api from "@/services/api";

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const image =
    product.image ||
    product.images?.[0] ||
    product.imageUrl ||
    "";

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    api.get("/account/wishlist").then((response) => {
      setLiked((response.data.products || []).some((item) => item._id === product._id));
    }).catch(() => {});
  }, [product._id]);

  async function toggleLike(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!localStorage.getItem("token") || likeLoading) return;
    setLikeLoading(true);
    try {
      if (liked) await api.delete(`/account/wishlist/${product._id}`);
      else await api.post(`/account/wishlist/${product._id}`);
      setLiked(!liked);
    } finally {
      setLikeLoading(false);
    }
  }

  return (
    <Link
      href={`/products/${product._id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#F5F5F1]">
        <button type="button" onClick={toggleLike} aria-label={liked ? `Unlike ${product.name}` : `Like ${product.name}`} className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#70765F] shadow-sm" disabled={likeLoading}>
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
        </button>
        <div className="flex aspect-square items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={product.name || "Product"}
              className="h-full w-full object-cover"
            />
          ) : (
            <ShoppingBag
              size={30}
              strokeWidth={1.3}
              className="text-[#7A8068]"
            />
          )}
        </div>
      </div>

      <div className="px-1 pt-3">
        <h3 className="line-clamp-1 text-sm font-medium text-gray-800">
          {product.name || "Untitled Product"}
        </h3>

        {product.category?.name && (
          <p className="mt-1 text-xs text-gray-400">
            {product.category.name}
          </p>
        )}

        <p className="mt-2 text-sm font-medium text-[#6F755F]">
          ₹{Number(product.price || 0).toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}
