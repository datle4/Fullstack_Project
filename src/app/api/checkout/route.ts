import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations/checkout";

class CheckoutRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
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
    const order = await prisma.$transaction(async (transaction) => {
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
        throw new CheckoutRequestError(
          400,
          "Giỏ hàng đang trống",
        );
      }

      for (const item of cartItems) {
        if (!item.product.isActive) {
          throw new CheckoutRequestError(
            409,
            `${item.product.name} đã ngừng bán`,
          );
        }

        if (item.product.stock === 0) {
          throw new CheckoutRequestError(
            409,
            `${item.product.name} đã hết hàng`,
          );
        }

        if (item.quantity > item.product.stock) {
          throw new CheckoutRequestError(
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

      for (const item of cartItems) {
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
          userId: session.user.id,
        },
      });

      return createdOrder;
    });

    return NextResponse.json(
      {
        message: "Đặt hàng thành công",
        order,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CheckoutRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    console.error("Checkout error:", error);

    return NextResponse.json(
      { message: "Không thể đặt hàng" },
      { status: 500 },
    );
  }
}