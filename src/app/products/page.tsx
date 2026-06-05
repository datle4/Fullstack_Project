import Image from "next/image";
import { prisma } from "@/lib/prisma";

function formatPrice(price: unknown) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-950">Laptop</h1>
          <p className="mt-2 text-sm text-slate-600">
            Danh sách sản phẩm đang có trong database local.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Chưa có sản phẩm nào.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="relative mb-4 aspect-4/3 overflow-hidden rounded-md bg-slate-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      No image
                    </div>
                  )}
                </div>

                <div className="mb-2 text-xs font-medium uppercase text-slate-500">
                  {product.brand}
                </div>

                <h2 className="line-clamp-2 min-h-12 text-base font-semibold text-slate-950">
                  {product.name}
                </h2>

                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p>CPU: {product.cpu ?? "Đang cập nhật"}</p>
                  <p>RAM: {product.ram ?? "Đang cập nhật"}</p>
                  <p>Ổ cứng: {product.storage ?? "Đang cập nhật"}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="font-semibold text-slate-950">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-xs text-slate-500">Còn {product.stock}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}