import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { CartItemControl } from "@/components/cart/cart-item-control";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function CartPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const cartItems = await prisma.cartItem.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          price: true,
          imageUrl: true,
          stock: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.product.price) * item.quantity,
    0,
  );

  const hasInvalidItems = cartItems.some(
    (item) =>
      !item.product.isActive ||
      item.product.stock === 0 ||
      item.quantity > item.product.stock,
  );

  return (
    <main className="min-h-screen bg-[#0b0d10] px-6 py-10 text-stone-100">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-[#e3c98d]"
        >
          <ArrowLeft size={17} />
          Tiếp tục mua hàng
        </Link>

        <h1 className="mt-6 text-3xl font-semibold">Giỏ hàng</h1>

        {cartItems.length === 0 ? (
          <section className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-lg border border-white/10 bg-[#14171b]">
            <ShoppingBag size={42} className="text-stone-600" />

            <p className="mt-4 text-lg font-medium">
              Giỏ hàng đang trống
            </p>

            <Link
              href="/products"
              className="mt-5 rounded-lg bg-[#d6b679] px-6 py-3 font-semibold text-[#111418]"
            >
              Xem sản phẩm
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-5 rounded-lg border border-white/10 bg-[#14171b] p-5"
                >
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative h-32 w-40 shrink-0 overflow-hidden rounded-lg bg-stone-200"
                  >
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        unoptimized
                        sizes="160px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-stone-600">
                        Chưa có ảnh
                      </span>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-xs font-semibold uppercase text-[#d6b679]">
                      {item.product.brand}
                    </p>

                    <Link
                      href={`/products/${item.product.slug}`}
                      className="mt-2 font-semibold hover:text-[#e3c98d]"
                    >
                      {item.product.name}
                    </Link>

                    {!item.product.isActive && (
                      <p className="mt-3 text-sm text-red-400">
                        Sản phẩm này đã ngừng bán
                      </p>
                    )}

                    {item.product.isActive &&
                      item.product.stock === 0 && (
                        <p className="mt-3 text-sm text-red-400">
                          Sản phẩm hiện đã hết hàng
                        </p>
                      )}

                    {item.product.isActive &&
                      item.product.stock > 0 &&
                      item.quantity > item.product.stock && (
                        <p className="mt-3 text-sm text-amber-400">
                          Kho chỉ còn {item.product.stock} sản phẩm.
                          Vui lòng điều chỉnh số lượng.
                        </p>
                      )}

                    <CartItemControl
                      itemId={item.id}
                      quantity={item.quantity}
                      stock={item.product.stock}
                      isActive={item.product.isActive}
                    />

                    <p className="mt-auto font-semibold">
                      {formatPrice(
                        Number(item.product.price) * item.quantity,
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-lg border border-white/10 bg-[#14171b] p-6">
              <h2 className="text-lg font-semibold">Tóm tắt đơn hàng</h2>

              <div className="mt-5 flex justify-between text-stone-400">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="mt-4 flex justify-between text-stone-400">
                <span>Phí vận chuyển</span>
                <span>Tính khi thanh toán</span>
              </div>

              <div className="mt-5 flex justify-between border-t border-white/10 pt-5 text-lg font-semibold">
                <span>Tổng cộng</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {hasInvalidItems ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 h-12 w-full rounded-lg bg-[#d6b679] font-semibold text-[#111418] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Tiến hành thanh toán
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#d6b679] font-semibold text-[#111418] transition hover:bg-[#e3c98d]"
                >
                  Tiến hành thanh toán
                </Link>
              )}

              {hasInvalidItems && (
                <p className="mt-3 text-sm text-amber-400">
                  Vui lòng xử lý các sản phẩm không hợp lệ trước khi
                  thanh toán.
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
