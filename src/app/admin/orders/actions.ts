"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

const allowedOrderStatuses = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.SHIPPING,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const orderId = formData.get("orderId");
  const status = formData.get("status");

  if (typeof orderId !== "string" || orderId.length === 0) {
    throw new Error("Order id không hợp lệ");
  }

  if (
    typeof status !== "string" ||
    !allowedOrderStatuses.includes(status as OrderStatus)
  ) {
    throw new Error("Trạng thái đơn hàng không hợp lệ");
  }

  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: status as OrderStatus,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
}