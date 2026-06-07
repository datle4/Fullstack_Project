import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const brands = Array.from(new Set(products.map((product) => product.brand)));

  return (
    <main className="bg-[linear-gradient(180deg,#0b0d10_0%,#111418_26%,#14171b_100%)] px-6 py-8 text-stone-100">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl border border-[#2f3540]/60 bg-[radial-gradient(circle_at_top_left,rgba(201,148,96,0.34),transparent_34%),linear-gradient(135deg,#171a1f,#121212_56%,#0b0d10)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 w-fit rounded-full border border-amber-700/50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-300">
                Premium Laptop
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                Khám phá laptop
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">
                Chọn laptop theo cấu hình, thương hiệu và nhu cầu sử dụng. Dữ
                liệu hiện được đọc trực tiếp từ PostgreSQL local qua Prisma.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex h-11 min-w-72 items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4">
                <Search size={18} className="text-stone-500" />
                <input
                  placeholder="Tìm laptop..."
                  className="w-full bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
                />
              </div>
              <button className="flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm text-stone-200 hover:border-amber-700/60">
                <SlidersHorizontal size={17} />
                Sắp xếp
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-xl border border-[#2a2f36] bg-[#14171b] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
              <Filter size={17} className="text-[#e3c98d]" />
              Bộ lọc
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Thương hiệu
              </h2>
              <div className="mt-3 space-y-2">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-3 text-sm text-stone-300"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-black accent-[#d6b679]"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Nhu cầu
              </h2>
              <div className="mt-3 space-y-2 text-sm text-stone-300">
                <div>Văn phòng</div>
                <div>Gaming</div>
                <div>Đồ họa - Kỹ thuật</div>
                <div>Mỏng nhẹ</div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-stone-400">
                Hiển thị{" "}
                <span className="font-medium text-stone-100">
                  {products.length}
                </span>{" "}
                sản phẩm
              </p>
              <p className="text-sm text-stone-500">Cập nhật mới nhất</p>
            </div>

            {products.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center text-stone-400">
                Chưa có sản phẩm nào.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
