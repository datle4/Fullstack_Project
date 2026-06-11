"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

type FieldErrors = Record<string, string[] | undefined>;

type RegisterResponse = {
  message?: string;
  errors?: FieldErrors;
};

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Không thể đăng ký tài khoản");
        return;
      }

      router.push("/");
      router.refresh();
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm text-stone-300">
          Họ và tên
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6b679]"
          placeholder="Nguyễn Văn A"
        />
        {fieldError("name") && (
          <p className="mt-2 text-sm text-red-400">{fieldError("name")}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-stone-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6b679]"
          placeholder="email@example.com"
        />
        {fieldError("email") && (
          <p className="mt-2 text-sm text-red-400">{fieldError("email")}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm text-stone-300">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6b679]"
          placeholder="Tối thiểu 8 ký tự"
        />
        {fieldError("password") && (
          <p className="mt-2 text-sm text-red-400">
            {fieldError("password")}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm text-stone-300"
        >
          Xác nhận mật khẩu
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6b679]"
          placeholder="Nhập lại mật khẩu"
        />
        {fieldError("confirmPassword") && (
          <p className="mt-2 text-sm text-red-400">
            {fieldError("confirmPassword")}
          </p>
        )}
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
            Đang đăng ký
          </>
        ) : (
          <>
            Tạo tài khoản
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-stone-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-[#d6b679] hover:text-[#e3c98d]">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}