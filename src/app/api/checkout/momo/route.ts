import { NextResponse } from "next/server";
import {
  PaymentProvider,
  PaymentStatus,
} from "@/generated/prisma/enums";
import { getCurrentSession } from "@/lib/auth/session";
import { buildMomoCreatePaymentPayload } from "@/lib/payments/momo";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { checkoutSchema } from "@/lib/validations/checkout";

class MomoCheckoutRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function getAppUrl() {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL is not set");
  }

  return appUrl;
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập để thanh toán" },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu JSON không hợp lệ" },
      { status: 400 },
    );
  }

  const result = checkoutSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Thông tin thanh toán không hợp lệ",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { customerName, phone, address, note } = result.data;

  try {
    const { order, payment } = await prisma.$transaction(
      async (transaction) => {
        const cartItems = await transaction.cartItem.findMany({
          where: {
            userId: session.user.id,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                isActive: true,
              },
            },
          },
        });

        if (cartItems.length === 0) {
          throw new MomoCheckoutRequestError(400, "Giỏ hàng đang trống");
        }

        for (const item of cartItems) {
          if (!item.product.isActive) {
            throw new MomoCheckoutRequestError(
              409,
              `${item.product.name} đã ngừng bán`,
            );
          }

          if (item.product.stock === 0) {
            throw new MomoCheckoutRequestError(
              409,
              `${item.product.name} đã hết hàng`,
            );
          }

          if (item.quantity > item.product.stock) {
            throw new MomoCheckoutRequestError(
              409,
              `${item.product.name} chỉ còn ${item.product.stock} sản phẩm`,
            );
          }
        }

        const totalAmount = cartItems.reduce(
          (total, item) =>
            total + Number(item.product.price) * item.quantity,
          0,
        );

        const createdOrder = await transaction.order.create({
          data: {
            userId: session.user.id,
            customerName,
            phone,
            address,
            note: note || null,
            totalAmount,
            item: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.product.price,
              })),
            },
          },
          select: {
            id: true,
            totalAmount: true,
          },
        });

        const createdPayment = await transaction.payment.create({
          data: {
            orderId: createdOrder.id,
            provider: PaymentProvider.MOMO,
            amount: totalAmount,
            providerRequestId: crypto.randomUUID(),
          },
          select: {
            id: true,
            providerRequestId: true,
          },
        });

        return {
          order: createdOrder,
          payment: createdPayment,
        };
      },
    );

    const appUrl = getAppUrl();

    const { endpoint, payload } = buildMomoCreatePaymentPayload({
      orderId: order.id,
      requestId: payment.providerRequestId,
      amount: Number(order.totalAmount),
      orderInfo: `Thanh toán đơn hàng ${order.id}`,
      redirectUrl: `${appUrl}/payment/momo/result?orderId=${order.id}`,
      ipnUrl: `${appUrl}/api/payments/momo/ipn`,
    });

    const momoResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const momoData = (await momoResponse.json()) as Prisma.InputJsonObject & {
      payUrl?: string;
      message?: string;
      resultCode?: number;
    };

    const isMomoCreateSuccess = momoResponse.ok && Boolean(momoData.payUrl);

    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: isMomoCreateSuccess
            ? PaymentStatus.PENDING
            : PaymentStatus.FAILED,
          payUrl: momoData.payUrl ?? null,
          rawResponse: momoData,
        },
      }),
      prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: isMomoCreateSuccess
            ? PaymentStatus.PENDING
            : PaymentStatus.FAILED,
        },
      }),
    ]);

    if (!isMomoCreateSuccess) {
      return NextResponse.json(
        {
          message:
            momoData.message ?? "Không thể tạo thanh toán MoMo",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        message: "Tạo thanh toán MoMo thành công",
        orderId: order.id,
        payUrl: momoData.payUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof MomoCheckoutRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    console.error("MoMo checkout error:", error);

    return NextResponse.json(
      { message: "Không thể tạo thanh toán MoMo" },
      { status: 500 },
    );
  }
}
