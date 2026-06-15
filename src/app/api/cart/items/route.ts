import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { addCartItemSchema } from "@/lib/validations/cart";

class CartRequestError extends Error {
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
      { message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng" },
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

  const result = addCartItemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Dữ liệu giỏ hàng không hợp lệ",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { productId, quantity } = result.data;

  try {
    const cart = await prisma.$transaction(async (transaction) => {
      const product = await transaction.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          stock: true,
          isActive: true,
        },
      });

      if (!product || !product.isActive) {
        throw new CartRequestError(
          404,
          "Sản phẩm không tồn tại hoặc đã ngừng bán",
        );
      }

      const existingCartItem = await transaction.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });

      const newQuantity =
        (existingCartItem?.quantity ?? 0) + quantity;

      if (newQuantity > product.stock) {
        throw new CartRequestError(
          409,
          `Chỉ còn ${product.stock} sản phẩm trong kho`,
        );
      }

      const cartItem = existingCartItem
        ? await transaction.cartItem.update({
            where: {
              id: existingCartItem.id,
            },
            data: {
              quantity: newQuantity,
            },
          })
        : await transaction.cartItem.create({
            data: {
              userId: session.user.id,
              productId,
              quantity,
            },
          });

      const cartSummary = await transaction.cartItem.aggregate({
        where: {
          userId: session.user.id,
        },
        _sum: {
          quantity: true,
        },
      });

      return {
        cartItem,
        totalQuantity: cartSummary._sum.quantity ?? 0,
      };
    });

    return NextResponse.json({
      message: "Đã thêm sản phẩm vào giỏ hàng",
      ...cart,
    });
  } catch (error) {
    if (error instanceof CartRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    console.error("Add cart item error:", error);

    return NextResponse.json(
      { message: "Không thể thêm sản phẩm vào giỏ hàng" },
      { status: 500 },
    );
  }
}