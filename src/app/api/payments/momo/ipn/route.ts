import { NextResponse } from "next/server";
import { PaymentStatus } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import {
  MomoIpnPayload,
  verifyMomoIpnSignature,
} from "@/lib/payments/momo";
import { prisma } from "@/lib/prisma";

function isMomoIpnPayload(value: unknown): value is MomoIpnPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.partnerCode === "string" &&
    typeof payload.orderId === "string" &&
    typeof payload.requestId === "string" &&
    typeof payload.amount === "number" &&
    typeof payload.orderInfo === "string" &&
    typeof payload.orderType === "string" &&
    typeof payload.transId === "number" &&
    typeof payload.resultCode === "number" &&
    typeof payload.message === "string" &&
    typeof payload.payType === "string" &&
    typeof payload.responseTime === "number" &&
    typeof payload.extraData === "string" &&
    typeof payload.signature === "string"
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu JSON không hợp lệ" },
      { status: 400 },
    );
  }

  if (!isMomoIpnPayload(body)) {
    return NextResponse.json(
      { message: "Dữ liệu IPN không hợp lệ" },
      { status: 400 },
    );
  }

  const payload = body;

  if (!verifyMomoIpnSignature(payload)) {
    return NextResponse.json(
      { message: "Chữ ký MoMo không hợp lệ" },
      { status: 401 },
    );
  }

  try {
    await prisma.$transaction(async (transaction) => {
      const payment = await transaction.payment.findUnique({
        where: {
          providerRequestId: payload.requestId,
        },
        include: {
          order: {
            include: {
              item: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (Number(payment.amount) !== payload.amount) {
        throw new Error("Payment amount mismatch");
      }

      if (payment.status === PaymentStatus.PAID) {
        return;
      }

      const nextStatus =
        payload.resultCode === 0
          ? PaymentStatus.PAID
          : PaymentStatus.FAILED;

      await transaction.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: nextStatus,
          providerTransactionId: String(payload.transId),
          rawResponse: payload as Prisma.InputJsonObject,
          paidAt: nextStatus === PaymentStatus.PAID ? new Date() : null,
        },
      });

      await transaction.order.update({
        where: {
          id: payment.orderId,
        },
        data: {
          paymentStatus: nextStatus,
        },
      });

      if (nextStatus !== PaymentStatus.PAID) {
        return;
      }

      for (const item of payment.order.item) {
        await transaction.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await transaction.cartItem.deleteMany({
        where: {
          userId: payment.order.userId,
          productId: {
            in: payment.order.item.map((item) => item.productId),
          },
        },
      });
    });

    return NextResponse.json({ message: "IPN processed" });
  } catch (error) {
    console.error("MoMo IPN error:", error);

    return NextResponse.json(
      { message: "Không thể xử lý IPN MoMo" },
      { status: 500 },
    );
  }
}