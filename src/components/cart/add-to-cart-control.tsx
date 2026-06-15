"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LoaderCircle,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

type AddToCartControlProps = {
  productId: string;
  stock: number;
};

type CartResponse = {
  message?: string;
  totalQuantity?: number;
};

export function AddToCartControl({
  productId,
  stock,
}: AddToCartControlProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(stock, current + 1));
  }

  async function handleAddToCart() {
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const data = (await response.json()) as CartResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setMessage(data.message ?? "Không thể thêm vào giỏ hàng");
        return;
      }

      setMessage(data.message ?? "Đã thêm vào giỏ hàng");
      setQuantity(1);
      router.refresh();
    } catch {
      setMessage("Không thể kết nối tới server");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (stock === 0) {
    return (
      <button
        type="button"
        disabled
        className="mt-8 h-12 rounded-lg bg-[#d6b679] opacity-40"
      >
        Hết hàng
      </button>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 items-center rounded-lg border border-white/10 bg-black/20">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity === 1 || isSubmitting}
            aria-label="Giảm số lượng"
            className="grid h-full w-11 place-items-center text-stone-300 transition hover:text-[#e3c98d] disabled:opacity-30"
          >
            <Minus size={17} />
          </button>

          <span className="w-10 text-center font-semibold">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={quantity === stock || isSubmitting}
            aria-label="Tăng số lượng"
            className="grid h-full w-11 place-items-center text-stone-300 transition hover:text-[#e3c98d] disabled:opacity-30"
          >
            <Plus size={17} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isSubmitting}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#d6b679] px-6 text-sm font-semibold text-[#111418] transition hover:bg-[#e3c98d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle size={19} className="animate-spin" />
          ) : (
            <ShoppingCart size={19} />
          )}

          {isSubmitting ? "Đang thêm" : "Thêm vào giỏ hàng"}
        </button>
      </div>

      {message && (
        <p aria-live="polite" className="mt-3 text-sm text-[#e3c98d]">
          {message}
        </p>
      )}
    </div>
  );
}