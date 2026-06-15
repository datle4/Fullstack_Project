"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LoaderCircle,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

type CartItemControlProps = {
  itemId: string;
  quantity: number;
  stock: number;
  isActive: boolean;
};

type CartResponse = {
  message?: string;
};

export function CartItemControl({
  itemId,
  quantity,
  stock,
  isActive,
}: CartItemControlProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateQuantity(nextQuantity: number) {
    if (
      nextQuantity < 1 ||
      nextQuantity > stock ||
      isUpdating
    ) {
      return;
    }

    setMessage("");
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          quantity: nextQuantity,
        }),
      });

      const data = (await response.json()) as CartResponse;

      if (!response.ok) {
        setMessage(data.message ?? "Không thể cập nhật giỏ hàng");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Không thể kết nối tới server");
    } finally {
      setIsUpdating(false);
    }
  }

  async function removeItem() {
    if (isUpdating) {
      return;
    }

    setMessage("");
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      const data = (await response.json()) as CartResponse;

      if (!response.ok) {
        setMessage(data.message ?? "Không thể xóa sản phẩm");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Không thể kết nối tới server");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 items-center rounded-lg border border-white/10 bg-black/20">
          <button
            type="button"
            onClick={() =>
              updateQuantity(quantity > stock ? stock : quantity - 1)
            }
            disabled={
              quantity === 1 ||
              stock === 0 ||
              !isActive ||
              isUpdating
            }
            aria-label="Giảm số lượng"
            className="grid h-full w-10 place-items-center text-stone-300 transition hover:text-[#e3c98d] disabled:opacity-30"
          >
            <Minus size={16} />
          </button>

          <span className="w-9 text-center text-sm font-semibold">
            {isUpdating ? (
              <LoaderCircle
                size={15}
                className="mx-auto animate-spin"
              />
            ) : (
              quantity
            )}
          </span>

          <button
            type="button"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={
              quantity >= stock ||
              stock === 0 ||
              !isActive ||
              isUpdating
            }
            aria-label="Tăng số lượng"
            className="grid h-full w-10 place-items-center text-stone-300 transition hover:text-[#e3c98d] disabled:opacity-30"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={removeItem}
          disabled={isUpdating}
          aria-label="Xóa sản phẩm khỏi giỏ hàng"
          className="grid h-10 w-10 place-items-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
        >
          <Trash2 size={17} />
        </button>
      </div>

      {message && (
        <p aria-live="polite" className="mt-2 text-sm text-red-400">
          {message}
        </p>
      )}
    </div>
  );
}
