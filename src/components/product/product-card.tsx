import Image from "next/image";
import { Heart } from "lucide-react";
import { QuickAddToCartButton } from "@/components/cart/quick-add-to-cart-button";
import Link from "next/link";


type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: unknown;
    imageUrl: string | null;
    cpu: string | null;
    ram: string | null;
    storage: string | null;
    gpu: string | null;
    screen: string | null;
    stock: number;
  };
};

function formatPrice(price: unknown) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-[#2a2f36] bg-[#15171b] shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:border-amber-700/60">
      <div className="relative m-3 aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-[#d8d7d2] to-[#a8adb5]">
        <Link
          href={`/products/${product.slug}`}
          className="relative block h-full w-full"
          aria-label={`Xem ${product.name}`}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              unoptimized
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover opacity-90 transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-500">
              No image
            </div>
          )}
        </Link>

        <button
          type="button"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/40 text-stone-200 backdrop-blur hover:text-amber-300"
          aria-label="Yêu thích"
        >
          <Heart size={17} />
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-[#e3c98d]">
          {product.brand}
        </div>

        <h2 className="mt-2 line-clamp-2 min-h-12 text-base font-semibold leading-6 text-stone-50">
          <Link
            href={`/products/${product.slug}`}
            className="transition hover:text-[#e3c98d]"
          >
            {product.name}
          </Link>
        </h2>

        <div className="mt-4 grid gap-2 text-sm text-stone-400">
          <div className="flex items-center justify-between gap-3">
            <span>CPU</span>
            <span className="truncate text-stone-200">
              {product.cpu ?? "Đang cập nhật"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>RAM</span>
            <span className="text-stone-200">
              {product.ram ?? "Đang cập nhật"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Ổ cứng</span>
            <span className="text-stone-200">
              {product.storage ?? "Đang cập nhật"}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-white">
              {formatPrice(product.price)}
            </p>
            <p className="mt-1 text-xs text-stone-500">Còn {product.stock}</p>
          </div>

          <QuickAddToCartButton
            productId={product.id}
            stock={product.stock}
          />
        </div>
      </div>
    </article>
  );
}
