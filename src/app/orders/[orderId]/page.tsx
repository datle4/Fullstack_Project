import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type OrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

function formatPrice(price: unknown) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const { orderId } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    include: {
      item: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              brand: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0b0d10] px-6 py-10 text-stone-100">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-lg border border-white/10 bg-[#14171b] p-8">
          <div className="flex items-start gap-4">
            <CheckCircle2
              size={36}
              className="mt-1 text-emerald-400"
            />

            <div>
              <p className="text-sm font-semibold uppercase text-[#d6b679]">
                Đặt hàng thành công
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                Cảm ơn bạn đã đặt hàng
              </h1>

              <p className="mt-3 text-stone-400">
                Mã đơn hàng:{" "}
                <span className="font-medium text-stone-100">
                  {order.id}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 border-y border-white/10 py-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-stone-500">Người nhận</p>
              <p className="mt-1 font-medium">{order.customerName}</p>
            </div>

            <div>
              <p className="text-sm text-stone-500">Số điện thoại</p>
              <p className="mt-1 font-medium">{order.phone}</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-stone-500">Địa chỉ</p>
              <p className="mt-1 font-medium">{order.address}</p>
            </div>

            {order.note && (
              <div className="sm:col-span-2">
                <p className="text-sm text-stone-500">Ghi chú</p>
                <p className="mt-1 font-medium">{order.note}</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Sản phẩm đã đặt</h2>

            <div className="mt-4 divide-y divide-white/10">
              {order.item.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 py-4"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#d6b679]">
                      {item.product.brand}
                    </p>

                    <Link
                      href={`/products/${item.product.slug}`}
                      className="mt-1 block font-medium hover:text-[#e3c98d]"
                    >
                      {item.product.name}
                    </Link>

                    <p className="mt-1 text-sm text-stone-500">
                      Số lượng: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(
                        Number(item.unitPrice) * item.quantity,
                      )}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      {formatPrice(item.unitPrice)} / sản phẩm
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-between border-t border-white/10 pt-6 text-lg font-semibold">
            <span>Tổng cộng</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-lg bg-[#d6b679] px-5 py-3 font-semibold text-[#111418] transition hover:bg-[#e3c98d]"
            >
              Tiếp tục mua hàng
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-white/10 px-5 py-3 font-semibold text-stone-200 transition hover:border-[#d6b679] hover:text-[#e3c98d]"
            >
              Về trang chủ
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}