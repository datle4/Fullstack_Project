import Link from "next/link";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    brand?: string | string[];
    sort?: string;
  }>;
};

const sortOptions = [
  {
    label: "Mới nhất",
    value: "newest",
  },
  {
    label: "Giá tăng dần",
    value: "price-asc",
  },
  {
    label: "Giá giảm dần",
    value: "price-desc",
  },
];

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const selectedBrands = Array.isArray(params.brand)
    ? params.brand
    : params.brand
      ? [params.brand]
      : [];
  const selectedBrandSet = new Set(selectedBrands);
  const sort = params.sort ?? "newest";
  const currentSortLabel =
    sortOptions.find((option) => option.value === sort)?.label ??
    "Mới nhất";

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query && {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          cpu: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    }),
    ...(selectedBrands.length > 0 && {
      brand: {
        in: selectedBrands,
      },
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [products, allProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        brand: true,
      },
      orderBy: {
        brand: "asc",
      },
    }),
  ]);

  const brands = Array.from(
    new Set(allProducts.map((product) => product.brand)),
  );

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

            <form
              action="/products"
              className="flex flex-col gap-3 sm:flex-row"
            >
              {selectedBrands.map((brand) => (
                <input
                  key={brand}
                  type="hidden"
                  name="brand"
                  value={brand}
                />
              ))}
              <div className="flex h-11 min-w-72 items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4">
                <Search size={18} className="text-stone-500" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Tìm laptop..."
                  className="w-full bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
                />
              </div>

              <div className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-stone-200">
                <SlidersHorizontal size={17} />
                <select
                  name="sort"
                  defaultValue={sort}
                  className="bg-transparent outline-none"
                >
                  {sortOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#14171b] text-stone-100"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button className="h-11 rounded-lg bg-[#d6b679] px-5 text-sm font-semibold text-[#111418] transition hover:bg-[#e3c98d]">
                Áp dụng
              </button>
            </form>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-xl border border-[#2a2f36] bg-[#14171b] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
              <Filter size={17} className="text-[#e3c98d]" />
              Bộ lọc
            </div>

            <form action="/products">
              {query && <input type="hidden" name="q" value={query} />}
              <input type="hidden" name="sort" value={sort} />

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
                      name="brand"
                      value={brand}
                      defaultChecked={selectedBrandSet.has(brand)}
                      className="h-4 w-4 rounded border-white/20 bg-black accent-[#d6b679]"
                    />
                    {brand}
                  </label>
                ))}
              </div>

              <button className="mt-5 h-10 w-full rounded-lg bg-[#d6b679] text-sm font-semibold text-[#111418] transition hover:bg-[#e3c98d]">
                Lọc sản phẩm
              </button>

              {(query || selectedBrands.length > 0 || sort !== "newest") && (
                <Link
                  href="/products"
                  className="mt-3 flex h-10 items-center justify-center rounded-lg border border-white/10 text-sm text-stone-300 transition hover:border-[#d6b679] hover:text-[#d6b679]"
                >
                  Xóa bộ lọc
                </Link>
              )}
            </form>

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
              <p className="text-sm text-stone-500">
                Sắp xếp: {currentSortLabel}
              </p>
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
