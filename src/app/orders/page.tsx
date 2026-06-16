import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";
import { PaymentStatus } from "@/generated/prisma/enums";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function formatPrice(price: unknown) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getPaymentBadge(paymentStatus: PaymentStatus) {
  if (paymentStatus === PaymentStatus.PAID) {
    return {
      label: "Đã thanh toán",
      className: "bg-emerald-500/10 text-emerald-400",
    };
  }

  if (paymentStatus === PaymentStatus.FAILED) {
    return {
      label: "Thanh toán thất bại",
      className: "bg-red-500/10 text-red-400",
    };
  }

  if (paymentStatus === PaymentStatus.REFUNDED) {
    return {
      label: "Đã hoàn tiền",
      className: "bg-sky-500/10 text-sky-400",
    };
  }

  return {
    label: "Chờ thanh toán",
    className: "bg-amber-500/10 text-amber-300",
  };
}

export default async function OrdersPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
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
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#0b0d10] px-6 py-10 text-stone-100">
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-sm font-semibold uppercase text-[#d6b679]">
            Tài khoản
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Đơn hàng của tôi
          </h1>
          <p className="mt-3 text-stone-400">
            Theo dõi các đơn hàng COD và MoMo của bạn tại LAPORA.
          </p>
        </div>

        {orders.length === 0 ? (
          <section className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-lg border border-white/10 bg-[#14171b] text-center">
            <Package size={42} className="text-stone-600" />

            <p className="mt-4 text-lg font-medium">
              Bạn chưa có đơn hàng nào
            </p>

            <Link
              href="/products"
              className="mt-5 rounded-lg bg-[#d6b679] px-6 py-3 font-semibold text-[#111418] transition hover:bg-[#e3c98d]"
            >
              Mua laptop ngay
            </Link>
          </section>
        ) : (
          <section className="mt-8 space-y-4">
            {orders.map((order) => {
              const paymentBadge = getPaymentBadge(order.paymentStatus);
              const firstItem = order.item[0];
              const remainingItems = order.item.length - 1;
              const latestPayment = order.payments[0];

              return (
                <article
                  key={order.id}
                  className="rounded-lg border border-white/10 bg-[#14171b] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm text-stone-400">
                          {order.id}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge.className}`}
                        >
                          {paymentBadge.label}
                        </span>

                        {latestPayment && (
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-stone-300">
                            {latestPayment.provider}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-stone-500">
                        Đặt lúc {formatDate(order.createdAt)}
                      </p>

                      {firstItem && (
                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase text-[#d6b679]">
                            {firstItem.product.brand}
                          </p>

                          <Link
                            href={`/products/${firstItem.product.slug}`}
                            className="mt-1 block font-semibold hover:text-[#e3c98d]"
                          >
                            {firstItem.product.name}
                          </Link>

                          <p className="mt-1 text-sm text-stone-500">
                            Số lượng: {firstItem.quantity}
                            {remainingItems > 0 &&
                              ` + ${remainingItems} sản phẩm khác`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-left md:text-right">
                      <p className="text-sm text-stone-500">Tổng cộng</p>
                      <p className="mt-1 text-xl font-semibold">
                        {formatPrice(order.totalAmount)}
                      </p>

                      <Link
                        href={`/orders/${order.id}`}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-stone-200 transition hover:border-[#d6b679] hover:text-[#e3c98d]"
                      >
                        Xem chi tiết
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}