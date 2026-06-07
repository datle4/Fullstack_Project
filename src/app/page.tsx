import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Cpu,
  Feather,
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { prisma } from "@/lib/prisma";

const categories = [
  {
    name: "Laptop",
    subtitle: "Văn phòng",
    icon: Laptop,
  },
  {
    name: "Laptop",
    subtitle: "Gaming",
    icon: Gamepad2,
  },
  {
    name: "Laptop",
    subtitle: "Đồ họa - Kỹ thuật",
    icon: Cpu,
  },
  {
    name: "Laptop",
    subtitle: "Mỏng nhẹ",
    icon: Feather,
  },
  {
    name: "Laptop",
    subtitle: "2 trong 1",
    icon: Monitor,
  },
  {
    name: "Phụ kiện",
    subtitle: "Laptop",
    icon: Headphones,
  },
];

const brands = [
  {
    name: "ASUS",
    logo: "/brands/asus.svg",
  },
  {
    name: "Acer",
    logo: "/brands/acer.svg",
  },
  {
    name: "Dell",
    logo: "/brands/dell.svg",
  },
  {
    name: "HP",
    logo: "/brands/hp.svg",
  },
  {
    name: "Lenovo",
    logo: "/brands/lenovo.svg",
    className: "h-15 max-w-55",
  },
  {
    name: "Apple",
    logo: "/brands/apple.svg",
  },
  {
    name: "MSI",
    logo: "/brands/msi.svg",
    className: "h-8 max-w-11",
  },
];

export default async function Home() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  return (
    <main className="bg-[linear-gradient(180deg,#0b0d10_0%,#111418_34%,#14171b_100%)] px-6 py-8 text-stone-100">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-2xl border border-[#2f3540]/60 bg-[radial-gradient(circle_at_78%_30%,rgba(201,148,96,0.24),transparent_28%),linear-gradient(135deg,#171a1f,#111315_52%,#080a0c)] shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
          <div className="grid min-h-[440px] gap-8 p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div className="flex flex-col justify-center">
              <p className="mb-5 w-fit rounded-full border border-amber-700/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-amber-300">
                Hiệu năng đỉnh cao
              </p>
              <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                Nâng tầm mọi trải nghiệm
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-stone-400">
                Khám phá laptop cho học tập, làm việc và gaming với cấu hình
                rõ ràng, giá minh bạch và trải nghiệm mua hàng gọn gàng.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#d6b679] px-6 text-sm font-semibold text-white transition hover:bg-[#e3c98d]"
                >
                  Khám phá ngay
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 px-6 text-sm font-semibold text-stone-100 transition hover:border-amber-700/60"
                >
                  Xem bộ sưu tập
                </Link>
              </div>

              <div className="mt-10 grid gap-4 text-sm text-stone-400 sm:grid-cols-3">
                <div className="flex gap-3">
                  <ShieldCheck size={20} className="text-[#e3c98d]" />
                  <span>Hàng chính hãng</span>
                </div>
                <div className="flex gap-3">
                  <BadgeCheck size={20} className="text-[#e3c98d]" />
                  <span>Bảo hành uy tín</span>
                </div>
                <div className="flex gap-3">
                  <Truck size={20} className="text-[#e3c98d]" />
                  <span>Giao hàng toàn quốc</span>
                </div>
              </div>
            </div>

            <div className="relative hidden items-center justify-center lg:flex">
              <div className="absolute inset-8 rounded-full bg-[#d6b679]/20 blur-3xl" />
              <div className="relative grid w-full max-w-xl gap-5">
                <div className="ml-auto h-36 w-80 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#d8d7d2,#8f877d)] shadow-2xl rotate-3" />
                <div className="h-44 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#ece8e1,#9a9187)] shadow-2xl -rotate-2" />
                <div className="ml-16 h-28 w-96 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#bdb6ad,#6f6861)] shadow-2xl rotate-1" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Danh mục nổi bật
            </h2>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-amber-300"
            >
              Xem tất cả
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={`${category.name}-${category.subtitle}`}
                  href="/products"
                  className="group flex items-center gap-3 rounded-xl border border-[#2a2f36] bg-[#14171b] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[#d6b679]/60 hover:bg-[#1b1e23]"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#d6b679]/30 bg-[#d6b679]/10 text-[#d6b679]">
                    <Icon size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-100">
                      {category.name}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {category.subtitle}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Sản phẩm nổi bật
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Dữ liệu đang lấy trực tiếp từ PostgreSQL local.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-amber-300"
            >
              Xem tất cả
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-[#2a2f36] bg-[#14171b] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Thương hiệu hàng đầu
            </h2>
            <Headphones size={20} className="text-[#e3c98d]" />
          </div>
          <div className="grid overflow-hidden rounded-xl border border-white/10 bg-black/20 sm:grid-cols-3 lg:grid-cols-7">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="flex h-20 items-center justify-center border-b border-r border-white/10 last:border-r-0 sm:[&:nth-child(3n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(7n)]:border-r-0"
              >
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  width={112}
                  height={40}
                  className={`w-auto object-contain opacity-75 transition hover:opacity-100 ${
                    brand.className ?? "h-10 max-w-28"
                  }`}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
