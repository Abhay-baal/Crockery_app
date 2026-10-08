import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product }) {
  const image =
    product.image ||
    product.images?.[0] ||
    product.imageUrl ||
    "";

  return (
    <Link
      href={`/products/${product._id}`}
      className="group block"
    >
      <div className="overflow-hidden rounded-2xl bg-[#F5F5F1]">
        <div className="flex aspect-square items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={product.name || "Product"}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
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
