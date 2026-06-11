import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập | LAPORA",
  description: "Đăng nhập vào tài khoản LAPORA",
};

export default function LoginPage() {
  return (
    <main className="bg-[linear-gradient(180deg,#0b0d10,#14171b)] px-6 py-12 text-stone-100">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-[#d6b679]"
        >
          <ArrowLeft size={17} />
          Quay lại trang chủ
        </Link>

        <section className="mt-6 rounded-xl border border-[#2a2f36] bg-[#14171b] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3">
            <LogIn size={25} className="text-[#d6b679]" />

            <div>
              <h1 className="text-2xl font-semibold text-white">
                Đăng nhập
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Tiếp tục mua hàng và quản lý đơn hàng.
              </p>
            </div>
          </div>

          <LoginForm />
        </section>
      </div>
    </main>
  );
}