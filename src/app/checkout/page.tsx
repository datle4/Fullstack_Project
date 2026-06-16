import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function CheckoutPage() {
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

  if (cartItems.length === 0) {
    redirect("/cart");
  }

  const hasInvalidItems = cartItems.some(
    (item) =>
      !item.product.isActive ||
      item.product.stock === 0 ||
      item.quantity > item.product.stock,
  );

  if (hasInvalidItems) {
    redirect("/cart");
  }

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.product.price) * item.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-[#0b0d10] px-6 py-10 text-stone-100">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-[#e3c98d]"
        >
          <ArrowLeft size={17} />
          Quay lại giỏ hàng
        </Link>

        <h1 className="mt-6 text-3xl font-semibold">Thanh toán</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="rounded-lg border border-white/10 bg-[#14171b] p-6">
            <h2 className="text-xl font-semibold">
              Thông tin giao hàng
            </h2>

            <div className="mt-6">
              <CheckoutForm />
            </div>
          </section>

          <aside className="h-fit rounded-lg border border-white/10 bg-[#14171b] p-6">
            <h2 className="text-lg font-semibold">Đơn hàng của bạn</h2>

            <div className="mt-5 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-stone-200"
                  >
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[10px] text-stone-600">
                        No image
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase text-[#d6b679]">
                      {item.product.brand}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-medium">
                      {item.product.name}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Số lượng: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">
                    {formatPrice(
                      Number(item.product.price) * item.quantity,
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
              <div className="flex justify-between text-sm text-stone-400">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm text-stone-400">
                <span>Phí vận chuyển</span>
                <span>Tính sau</span>
              </div>

              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}