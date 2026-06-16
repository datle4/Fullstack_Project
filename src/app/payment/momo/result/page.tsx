import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCw,
  ShoppingBag,
} from "lucide-react";
import { PaymentStatus } from "@/generated/prisma/enums";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type MomoResultPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

function getPaymentMessage(paymentStatus: PaymentStatus) {
  if (paymentStatus === PaymentStatus.PAID) {
    return {
      title: "Thanh toán thành công",
      description:
        "MoMo đã xác nhận thanh toán. Đơn hàng của bạn đang được xử lý.",
      icon: CheckCircle2,
      tone: "text-emerald-400",
    };
  }

  if (paymentStatus === PaymentStatus.FAILED) {
    return {
      title: "Thanh toán thất bại",
      description:
        "MoMo chưa xác nhận thanh toán thành công. Bạn có thể thử lại hoặc chọn phương thức khác.",
      icon: AlertCircle,
      tone: "text-red-400",
    };
  }

  return {
    title: "Đang chờ xác nhận thanh toán",
    description:
      "MoMo có thể cần thêm vài giây để gửi IPN về hệ thống. Vui lòng tải lại trang sau ít phút.",
    icon: Clock,
    tone: "text-[#d6b679]",
  };
}

export default async function MomoResultPage({
  searchParams,
}: MomoResultPageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/cart");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    include: {
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!order) {
    redirect("/cart");
  }

  const status = getPaymentMessage(order.paymentStatus);
  const StatusIcon = status.icon;

  return (
    <main className="min-h-screen bg-[#0b0d10] px-6 py-16 text-stone-100">
      <section className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-[#14171b] p-8 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ${status.tone}`}
        >
          <StatusIcon size={34} />
        </div>

        <h1 className="mt-6 text-3xl font-semibold">{status.title}</h1>

        <p className="mt-3 text-stone-400">{status.description}</p>

        <div className="mt-8 rounded-lg border border-white/10 bg-black/20 p-5 text-left">
          <p className="text-sm text-stone-500">Mã đơn hàng</p>
          <p className="mt-1 font-mono text-sm text-stone-200">
            {order.id}
          </p>

          <p className="mt-4 text-sm text-stone-500">Trạng thái thanh toán</p>
          <p className={`mt-1 font-semibold ${status.tone}`}>
            {order.paymentStatus}
          </p>

          {order.payments[0]?.providerTransactionId && (
            <>
              <p className="mt-4 text-sm text-stone-500">
                Mã giao dịch MoMo
              </p>
              <p className="mt-1 font-mono text-sm text-stone-200">
                {order.payments[0].providerTransactionId}
              </p>
            </>
          )}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {order.paymentStatus === PaymentStatus.PENDING && (
            <Link
              href={`/payment/momo/result?orderId=${order.id}`}
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#d6b679]/50 text-[#d6b679] transition hover:border-[#d6b679] hover:bg-[#d6b679]/10 sm:col-span-2"
            >
              <RotateCw size={18} />
              Tải lại trạng thái
            </Link>
          )}

          <Link
            href={`/orders/${order.id}`}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#d6b679] font-semibold text-[#111418] transition hover:bg-[#e3c98d]"
          >
            <ShoppingBag size={18} />
            Xem chi tiết đơn hàng
          </Link>

          <Link
            href="/products"
            className="flex h-12 items-center justify-center rounded-lg border border-white/10 text-stone-200 transition hover:border-[#d6b679] hover:text-[#d6b679]"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    </main>
  );
}
