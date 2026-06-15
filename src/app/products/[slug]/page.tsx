import Image from "next/image";
import Link from "next/link";
import { AddToCartControl } from "@/components/cart/add-to-cart-control";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Box,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPrice(price: unknown) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const specifications = [
    {
      label: "CPU",
      value: product.cpu,
      icon: Cpu,
    },
    {
      label: "RAM",
      value: product.ram,
      icon: MemoryStick,
    },
    {
      label: "Ổ cứng",
      value: product.storage,
      icon: HardDrive,
    },
    {
      label: "Card đồ họa",
      value: product.gpu,
      icon: Box,
    },
    {
      label: "Màn hình",
      value: product.screen,
      icon: Monitor,
    },
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#0b0d10_0%,#111418_45%,#14171b_100%)] px-6 py-8 text-stone-100">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-[#e3c98d]"
        >
          <ArrowLeft size={17} />
          Quay lại sản phẩm
        </Link>

        <section className="grid gap-8 rounded-xl border border-[#2a2f36] bg-[#14171b] p-6 lg:grid-cols-2 lg:p-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-[#d8d7d2] to-[#a8adb5]">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                priority
                unoptimized
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-600">
                Chưa có ảnh sản phẩm
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#e3c98d]">
              {product.brand}
            </p>

            <h1 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <p className="text-3xl font-semibold text-white">
                {formatPrice(product.price)}
              </p>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  product.stock > 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
              </span>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {specifications.slice(0, 4).map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/20 p-4"
                >
                  <Icon size={19} className="mt-0.5 text-[#d6b679]" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-stone-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm text-stone-200">
                      {value ?? "Đang cập nhật"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <AddToCartControl
              productId={product.id}
              stock={product.stock}
            />

            <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 text-sm text-stone-400 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <BadgeCheck size={18} className="text-[#d6b679]" />
                Chính hãng
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#d6b679]" />
                Bảo hành uy tín
              </div>
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-[#d6b679]" />
                Giao hàng toàn quốc
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-[#2a2f36] bg-[#14171b] p-6">
          <h2 className="text-xl font-semibold text-white">
            Thông số kỹ thuật
          </h2>

          <div className="mt-5 divide-y divide-white/10">
            {specifications.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="grid gap-3 py-4 sm:grid-cols-[220px_1fr]"
              >
                <div className="flex items-center gap-3 text-stone-400">
                  <Icon size={18} className="text-[#d6b679]" />
                  {label}
                </div>
                <p className="text-stone-100">
                  {value ?? "Đang cập nhật"}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}