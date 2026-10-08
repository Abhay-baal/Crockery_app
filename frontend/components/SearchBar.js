"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar({
  placeholder = "Search products...",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const [value, setValue] = useState(initialSearch);

  function submitSearch(e) {
    e.preventDefault();

    const search = value.trim();

    if (!search) {
      router.push("/products");
      return;
    }

    router.push(
      `/products?search=${encodeURIComponent(search)}`
    );
  }

  function clearSearch() {
    setValue("");
    router.push("/products");
  }

  return (
    <form onSubmit={submitSearch} className="relative">
      <Search
        size={18}
        strokeWidth={1.7}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-black/5 bg-[#F7F7F4] py-3.5 pl-11 pr-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#8A9078] focus:bg-white"
      />

      {value && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <X size={17} />
        </button>
      )}
    </form>
  );
}
