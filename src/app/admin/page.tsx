import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [
    activeProductCount,
    totalOrderCount,
    pendingOrderCount,
    confirmedOrderCount,
    paidRevenue,
    latestOrders,
  ] = await Promise.all([
    prisma.product.count({
      where: {
        isActive: true,
      },
    }),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.order.count({
      where: {
        status: "CONFIRMED",
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
      },
      _sum: {
        totalAmount: true,
      },
    }),

    prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        item: {
          include: {
            product: {
              select: {
                name: true,
                brand: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const revenue = Number(paidRevenue._sum.totalAmount ?? 0);

  const stats = [
    {
      label: "Sản phẩm đang bán",
      value: activeProductCount.toString(),
      description: "Sản phẩm đang active trên website",
    },
    {
      label: "Tổng đơn hàng",
      value: totalOrderCount.toString(),
      description: "Tất cả đơn COD và MoMo",
    },
    {
      label: "Đơn chờ xác nhận",
      value: pendingOrderCount.toString(),
      description: "Đơn mới cần admin xử lý",
    },
    {
      label: "Đơn đã xác nhận",
      value: confirmedOrderCount.toString(),
      description: "Đơn đang chờ giao hoặc xử lý tiếp",
    },
    {
      label: "Doanh thu đã thanh toán",
      value: formatCurrency(revenue),
      description: "Tính theo đơn có paymentStatus PAID",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080a0c] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d6b675]">
            Admin Dashboard
          </p>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Quản trị LAPORA
              </h1>
              <p className="mt-3 text-neutral-400">
                Xin chào {admin.name ?? admin.email}. Đây là khu vực quản lý dữ
                liệu bán hàng và vận hành.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-[#d6b675] hover:text-[#d6b675]"
              >
                Về trang chủ
              </Link>

              <Link
                href="/orders"
                className="rounded-lg bg-[#d6b675] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#e2c987]"
              >
                Xem đơn của tôi
              </Link>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-5"
            >
              <p className="text-sm text-neutral-400">{item.label}</p>
              <p className="mt-3 text-2xl font-bold">{item.value}</p>
              <p className="mt-2 text-sm text-neutral-500">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-xl font-bold">Đơn hàng mới nhất</h2>
              <p className="mt-1 text-sm text-neutral-400">
                5 đơn gần nhất trong hệ thống.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-[#d6b675] hover:text-[#e2c987]"
            >
              Quản lý đơn hàng
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {latestOrders.length === 0 ? (
              <p className="px-5 py-8 text-neutral-400">
                Chưa có đơn hàng nào.
              </p>
            ) : (
              latestOrders.map((order) => {
                const firstItem = order.item[0];

                return (
                  <div
                    key={order.id}
                    className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_1fr_auto]"
                  >
                    <div>
                      <p className="font-mono text-sm text-neutral-400">
                        {order.id}
                      </p>
                      <p className="mt-2 font-semibold">
                        {firstItem
                          ? `${firstItem.product.brand} - ${firstItem.product.name}`
                          : "Không có sản phẩm"}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Khách hàng: {order.user.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-start gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-neutral-200">
                        {order.status}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-neutral-200">
                        {order.paymentStatus}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-neutral-200">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(Number(order.totalAmount))}
                      </p>
                      <Link
                        href={`/orders/${order.id}`}
                        className="mt-2 inline-block text-sm font-semibold text-[#d6b675] hover:text-[#e2c987]"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}