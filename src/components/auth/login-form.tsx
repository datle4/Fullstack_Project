"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

type FieldErrors = Record<string, string[] | undefined>;

type LoginResponse = {
  message?: string;
  errors?: FieldErrors;
};

export function LoginForm() {
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
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Không thể đăng nhập");
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
        <label htmlFor="email" className="mb-2 block text-sm text-stone-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="email@example.com"
          className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6b679]"
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
          autoComplete="current-password"
          required
          placeholder="Nhập mật khẩu"
          className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6b679]"
        />

        {fieldError("password") && (
          <p className="mt-2 text-sm text-red-400">
            {fieldError("password")}
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
            Đang đăng nhập
          </>
        ) : (
          <>
            Đăng nhập
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-stone-500">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-[#d6b679] hover:text-[#e3c98d]">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}