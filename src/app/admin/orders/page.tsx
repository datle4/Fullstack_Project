import Link from "next/link";
import { updateOrderStatus } from "./actions";
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";
import {
  PaymentProvider,
  PaymentStatus,
} from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth/admin";
import { isMomoPaymentExpired } from "@/lib/payments/expiration";
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

function getPaymentBadge(
  paymentStatus: PaymentStatus,
  paymentProvider: PaymentProvider,
  isPaymentExpired: boolean,
) {
  if (isPaymentExpired) {
    return {
      label: "Thanh toán hết hạn",
      className: "bg-red-500/10 text-red-400",
    };
  }

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

  if (
    paymentProvider === PaymentProvider.COD &&
    paymentStatus === PaymentStatus.PENDING
  ) {
    return {
      label: "Chờ xác nhận đơn hàng",
      className: "bg-sky-500/10 text-sky-300",
    };
  }

  return {
    label: "Chờ thanh toán",
    className: "bg-amber-500/10 text-amber-300",
  };
}

function getOrderStatusBadge(status: string) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-300",
    CONFIRMED: "bg-sky-500/10 text-sky-300",
    SHIPPING: "bg-violet-500/10 text-violet-300",
    COMPLETED: "bg-emerald-500/10 text-emerald-400",
    CANCELLED: "bg-red-500/10 text-red-400",
  };

  return styles[status] ?? "bg-white/10 text-stone-300";
}

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
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
                Admin Orders
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight">
                Quản lý đơn hàng
              </h1>
              <p className="mt-3 text-neutral-400">
                Xem toàn bộ đơn hàng COD và MoMo trong hệ thống.
              </p>
            </div>

            <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-300">
              {orders.length} đơn hàng
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-center">
            <ClipboardList size={44} className="text-neutral-600" />
            <p className="mt-4 text-lg font-semibold">Chưa có đơn hàng</p>
            <p className="mt-2 text-sm text-neutral-500">
              Khi khách hàng checkout, đơn hàng sẽ xuất hiện tại đây.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {orders.map((order) => {
              const firstItem = order.item[0];
              const remainingItems = order.item.length - 1;
              const latestPayment = order.payments[0];

              const isPaymentExpired = isMomoPaymentExpired({
                provider: latestPayment?.provider,
                status: order.paymentStatus,
                createdAt: latestPayment?.createdAt,
              });

              const paymentBadge = getPaymentBadge(
                order.paymentStatus,
                latestPayment?.provider ?? PaymentProvider.COD,
                isPaymentExpired,
              );

              return (
                <article
                  key={order.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm text-neutral-400">
                          {order.id}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getOrderStatusBadge(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge.className}`}
                        >
                          {paymentBadge.label}
                        </span>

                        {latestPayment && (
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-neutral-300">
                            {latestPayment.provider}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-neutral-500">
                        Đặt lúc {formatDate(order.createdAt)}
                      </p>

                      <p className="mt-2 text-sm text-neutral-500">
                        Khách hàng:{" "}
                        <span className="text-neutral-300">
                          {order.user.name ?? order.user.email}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        Email:{" "}
                        <span className="text-neutral-300">
                          {order.user.email}
                        </span>
                      </p>
                    </div>

                    <div>
                      {firstItem ? (
                        <>
                          <p className="text-xs font-semibold uppercase text-[#d6b675]">
                            {firstItem.product.brand}
                          </p>

                          <Link
                            href={`/products/${firstItem.product.slug}`}
                            className="mt-1 block font-semibold text-neutral-100 transition hover:text-[#e3c98d]"
                          >
                            {firstItem.product.name}
                          </Link>

                          <p className="mt-2 text-sm text-neutral-500">
                            Số lượng: {firstItem.quantity}
                            {remainingItems > 0 &&
                              ` + ${remainingItems} sản phẩm khác`}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-neutral-500">
                          Đơn hàng không có sản phẩm.
                        </p>
                      )}
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-sm text-neutral-500">Tổng cộng</p>
                      <p className="mt-1 text-xl font-bold">
                        {formatPrice(order.totalAmount)}
                      </p>
                      
                      <form action={updateOrderStatus} className="mt-4 flex flex-col gap-2">
                        <input type="hidden" name="orderId" value={order.id} />

                        <label
                            htmlFor={`status-${order.id}`}
                            className="text-sm text-neutral-500"
                        >
                            Cập nhật trạng thái
                        </label>

                        <div className="flex gap-2">
                            <select
                            id={`status-${order.id}`}
                            name="status"
                            defaultValue={order.status}
                            className="min-h-10 rounded-lg border border-white/10 bg-[#111418] px-3 text-sm text-neutral-100 outline-none transition focus:border-[#d6b675]"
                            >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="SHIPPING">SHIPPING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            </select>

                            <button
                            type="submit"
                            className="min-h-10 rounded-lg bg-[#d6b675] px-4 text-sm font-semibold text-black transition hover:bg-[#e2c987]"
                            >
                            Lưu
                            </button>
                        </div>
                      </form>


                      <Link
                        href={`/orders/${order.id}`}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-[#d6b675] hover:text-[#e3c98d]"
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