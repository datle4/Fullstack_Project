"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, LoaderCircle, ShoppingCart } from "lucide-react";

type QuickAddToCartButtonProps = {
  productId: string;
  stock: number;
};

export function QuickAddToCartButton({
  productId,
  stock,
}: QuickAddToCartButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success"
  >("idle");

  async function handleAddToCart() {
    if (stock === 0 || status === "loading") {
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setStatus("idle");
        return;
      }

      setStatus("success");
      router.refresh();

      window.setTimeout(() => {
        setStatus("idle");
      }, 1200);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={stock === 0 || status === "loading"}
      aria-label="Thêm một sản phẩm vào giỏ hàng"
      className="grid h-10 w-10 place-items-center rounded-lg bg-[#d6b679] text-white transition hover:bg-[#e3c98d] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {status === "loading" && (
        <LoaderCircle size={18} className="animate-spin" />
      )}

      {status === "success" && <Check size={18} />}

      {status === "idle" && <ShoppingCart size={18} />}
    </button>
  );
}