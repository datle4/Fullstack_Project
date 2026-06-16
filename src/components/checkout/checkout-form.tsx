"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

type FieldErrors = Record<string, string[] | undefined>;

type CheckoutResponse = {
  message?: string;
  errors?: FieldErrors;
  order?: {
    id: string;
  };
  orderId?: string;
  payUrl?: string;
};

export function CheckoutForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "MOMO">("COD");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      customerName: formData.get("customerName"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      note: formData.get("note"),
    };

    try {
      const response = await fetch(
        paymentMethod === "MOMO" ? "/api/checkout/momo" : "/api/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as CheckoutResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Không thể đặt hàng");
        return;
      }

      if (paymentMethod === "MOMO" && data.payUrl) {
        window.location.href = data.payUrl;
        return;
      }

      if (data.order?.id) {
        router.push(`/orders/${data.order.id}`);
        router.refresh();
      }
    } catch {
      setMessage("Không thể kết nối tới server");
    } finally {
      setIsSubmitting(false);
    }
  }

  function fieldError(field: string) {
    return errors[field]?.[0];
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="customerName"
          className="mb-2 block text-sm text-stone-300"
        >
          Họ và tên người nhận
        </label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          required
          autoComplete="name"
          className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6b679]"
          placeholder="Nguyễn Văn A"
        />
        {fieldError("customerName") && (
          <p className="mt-2 text-sm text-red-400">
            {fieldError("customerName")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm text-stone-300">
          Số điện thoại
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6b679]"
          placeholder="0901234567"
        />
        {fieldError("phone") && (
          <p className="mt-2 text-sm text-red-400">
            {fieldError("phone")}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-2 block text-sm text-stone-300"
        >
          Địa chỉ giao hàng
        </label>
        <textarea
          id="address"
          name="address"
          required
          rows={4}
          autoComplete="street-address"
          className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6b679]"
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
        />
        {fieldError("address") && (
          <p className="mt-2 text-sm text-red-400">
            {fieldError("address")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="note" className="mb-2 block text-sm text-stone-300">
          Ghi chú
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6b679]"
          placeholder="Ví dụ: Giao giờ hành chính"
        />
        {fieldError("note") && (
          <p className="mt-2 text-sm text-red-400">
            {fieldError("note")}
          </p>
        )}
      </div>

      <div>
        <p className="mb-3 text-sm text-stone-300">
          Phương thức thanh toán
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="cursor-pointer rounded-lg border border-white/10 bg-black/20 p-4 transition has-[:checked]:border-[#d6b679] has-[:checked]:bg-[#d6b679]/10">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
              className="sr-only"
            />
            <span className="block font-semibold text-stone-100">
              Thanh toán khi nhận hàng
            </span>
            <span className="mt-1 block text-sm text-stone-500">
              COD - trả tiền sau khi nhận laptop
            </span>
          </label>

          <label className="cursor-pointer rounded-lg border border-white/10 bg-black/20 p-4 transition has-[:checked]:border-[#d6b679] has-[:checked]:bg-[#d6b679]/10">
            <input
              type="radio"
              name="paymentMethod"
              value="MOMO"
              checked={paymentMethod === "MOMO"}
              onChange={() => setPaymentMethod("MOMO")}
              className="sr-only"
            />
            <span className="block font-semibold text-stone-100">
              Ví MoMo
            </span>
            <span className="mt-1 block text-sm text-stone-500">
              Chuyển sang MoMo để thanh toán online
            </span>
          </label>
        </div>
      </div>

      {message && (
        <p aria-live="polite" className="text-sm text-red-400">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#d6b679] font-semibold text-[#111418] transition hover:bg-[#e3c98d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            {paymentMethod === "MOMO"
              ? "Đang tạo thanh toán"
              : "Đang đặt hàng"}
          </>
        ) : (
          <>
            {paymentMethod === "MOMO"
              ? "Thanh toán với MoMo"
              : "Đặt hàng"}
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
