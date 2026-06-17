import Link from "next/link";
import { ArrowLeft, Box, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { updateProductInventory } from "./actions";

function formatPrice(price: unknown) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: [
      {
        isActive: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      price: true,
      stock: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#080a0c] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-b border-white/10 pb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 transition hover:text-[#d6b675]"
          >
            <ArrowLeft size={16} />
            Quay lại dashboard
          </Link>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d6b675]">
                Admin Products
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight">
                Quản lý sản phẩm
              </h1>
              <p className="mt-3 text-neutral-400">
                Cập nhật tồn kho và trạng thái hiển thị của sản phẩm.
              </p>
            </div>

            <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-300">
              {products.length} sản phẩm
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-center">
            <Box size={44} className="text-neutral-600" />
            <p className="mt-4 text-lg font-semibold">Chưa có sản phẩm</p>
            <p className="mt-2 text-sm text-neutral-500">
              Sau khi import dữ liệu, sản phẩm sẽ xuất hiện tại đây.
            </p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_1fr] gap-4 border-b border-white/10 px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              <span>Sản phẩm</span>
              <span>Giá</span>
              <span>Trạng thái</span>
              <span className="text-right">Quản lý tồn kho</span>
            </div>

            <div className="divide-y divide-white/10">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[1.4fr_0.8fr_0.7fr_1fr] lg:items-center"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#d6b675]">
                      {product.brand}
                    </p>

                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-1 inline-flex items-center gap-2 font-semibold text-neutral-100 transition hover:text-[#e3c98d]"
                    >
                      {product.name}
                      <ExternalLink size={15} />
                    </Link>

                    <p className="mt-2 font-mono text-xs text-neutral-500">
                      {product.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-lg font-bold">
                      {formatPrice(product.price)}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Còn {product.stock}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.isActive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {product.isActive ? "Đang bán" : "Đã ẩn"}
                    </span>
                  </div>

                  <form
                    action={updateProductInventory}
                    className="flex flex-col gap-3 lg:items-end"
                  >
                    <input type="hidden" name="productId" value={product.id} />

                    <div className="flex flex-wrap items-center gap-3">
                      <label
                        htmlFor={`stock-${product.id}`}
                        className="text-sm text-neutral-500"
                      >
                        Stock
                      </label>

                      <input
                        id={`stock-${product.id}`}
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={product.stock}
                        className="h-10 w-24 rounded-lg border border-white/10 bg-[#111418] px-3 text-sm text-neutral-100 outline-none transition focus:border-[#d6b675]"
                      />

                      <label className="flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-neutral-300">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={product.isActive}
                          className="h-4 w-4 accent-[#d6b675]"
                        />
                        Đang bán
                      </label>

                      <button
                        type="submit"
                        className="h-10 rounded-lg bg-[#d6b675] px-4 text-sm font-semibold text-black transition hover:bg-[#e2c987]"
                      >
                        Lưu
                      </button>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}