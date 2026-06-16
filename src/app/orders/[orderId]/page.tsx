import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import {
  PaymentProvider,
  PaymentStatus,
} from "@/generated/prisma/enums";
import { getCurrentSession } from "@/lib/auth/session";
import { isMomoPaymentExpired } from "@/lib/payments/expiration";
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

function getPaymentDisplay(
  paymentStatus: PaymentStatus,
  paymentProvider: PaymentProvider,
  isPaymentExpired: boolean,
) {
  if (isPaymentExpired) {
    return {
      label: "Thanh toán hết hạn",
      eyebrow: "Thanh toán MoMo đã hết hạn",
      title: "Link thanh toán đã hết hạn",
      description:
        "Đơn MoMo này chưa được thanh toán trong thời gian cho phép. Bạn có thể đặt lại đơn hoặc chọn phương thức khác.",
      icon: AlertCircle,
      iconClassName: "text-red-400",
      badgeClassName: "bg-red-500/10 text-red-400",
    };
  }

  if (
    paymentProvider === PaymentProvider.COD &&
    paymentStatus === PaymentStatus.PENDING
  ) {
    return {
      label: "Chờ xác nhận đơn hàng",
      eyebrow: "Đơn COD đã được tạo",
      title: "Đơn hàng đang chờ xác nhận",
      description:
        "Đơn COD đã được ghi nhận. Khách hàng sẽ thanh toán khi nhận hàng.",
      icon: Clock,
      iconClassName: "text-sky-300",
      badgeClassName: "bg-sky-500/10 text-sky-300",
    };
  }

  if (paymentStatus === PaymentStatus.PAID) {
    return {
      label: "Đã thanh toán",
      eyebrow: "Thanh toán thành công",
      title: "Cảm ơn bạn đã đặt hàng",
      description: "Thanh toán đã được xác nhận.",
      icon: CheckCircle2,
      iconClassName: "text-emerald-400",
      badgeClassName: "bg-emerald-500/10 text-emerald-400",
    };
  }

  if (paymentStatus === PaymentStatus.FAILED) {
    return {
      label: "Thanh toán thất bại",
      eyebrow: "Thanh toán chưa hoàn tất",
      title: "Đơn hàng chưa được thanh toán",
      description:
        "Thanh toán không thành công. Bạn có thể đặt lại đơn hoặc chọn phương thức khác.",
      icon: AlertCircle,
      iconClassName: "text-red-400",
      badgeClassName: "bg-red-500/10 text-red-400",
    };
  }

  if (paymentStatus === PaymentStatus.REFUNDED) {
    return {
      label: "Đã hoàn tiền",
      eyebrow: "Đơn hàng đã hoàn tiền",
      title: "Thanh toán đã được hoàn lại",
      description: "Khoản thanh toán của đơn hàng này đã được hoàn tiền.",
      icon: AlertCircle,
      iconClassName: "text-sky-400",
      badgeClassName: "bg-sky-500/10 text-sky-400",
    };
  }

  return {
    label: "Chờ thanh toán",
    eyebrow: "Đơn hàng đang chờ thanh toán",
    title: "Đơn hàng đã được tạo",
    description:
      "Hệ thống đang chờ xác nhận thanh toán hoặc xử lý COD.",
    icon: Clock,
    iconClassName: "text-amber-300",
    badgeClassName: "bg-amber-500/10 text-amber-300",
  };
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
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!order) {
    notFound();
  }

  const latestPayment = order.payments[0];
  const isPaymentExpired = isMomoPaymentExpired({
    provider: latestPayment?.provider,
    status: order.paymentStatus,
    createdAt: latestPayment?.createdAt,
  });
  const paymentDisplay = getPaymentDisplay(
    order.paymentStatus,
    latestPayment?.provider ?? PaymentProvider.COD,
    isPaymentExpired,
  );
  const PaymentIcon = paymentDisplay.icon;

  return (
    <main className="min-h-screen bg-[#0b0d10] px-6 py-10 text-stone-100">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-lg border border-white/10 bg-[#14171b] p-8">
          <div className="flex items-start gap-4">
            <PaymentIcon
              size={36}
              className={`mt-1 ${paymentDisplay.iconClassName}`}
            />

            <div>
              <p className="text-sm font-semibold uppercase text-[#d6b679]">
                {paymentDisplay.eyebrow}
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                {paymentDisplay.title}
              </h1>

              <p className="mt-3 text-stone-400">
                Mã đơn hàng:{" "}
                <span className="font-medium text-stone-100">
                  {order.id}
                </span>
              </p>

              <p className="mt-2 text-stone-400">
                {paymentDisplay.description}
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

            <div>
              <p className="text-sm text-stone-500">
                Trạng thái thanh toán
              </p>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${paymentDisplay.badgeClassName}`}
              >
                {paymentDisplay.label}
              </span>
            </div>

            <div>
              <p className="text-sm text-stone-500">
                Phương thức thanh toán
              </p>
              <p className="mt-1 font-medium">
                {latestPayment?.provider ?? "COD"}
              </p>
            </div>

            {latestPayment?.providerTransactionId && (
              <div className="sm:col-span-2">
                <p className="text-sm text-stone-500">
                  Mã giao dịch thanh toán
                </p>
                <p className="mt-1 font-mono text-sm font-medium">
                  {latestPayment.providerTransactionId}
                </p>
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
