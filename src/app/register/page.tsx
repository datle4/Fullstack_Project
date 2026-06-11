import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Đăng ký | LAPORA",
  description: "Tạo tài khoản LAPORA",
};

export default function RegisterPage() {
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
            <ShieldCheck size={25} className="text-[#d6b679]" />
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Tạo tài khoản
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Đăng ký để mua hàng và theo dõi đơn hàng.
              </p>
            </div>
          </div>

          <RegisterForm />
        </section>
      </div>
    </main>
  );
}