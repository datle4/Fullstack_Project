import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { updateCartItemSchema } from "@/lib/validations/cart";

type CartItemRouteProps = {
  params: Promise<{
    itemId: string;
  }>;
};

class CartRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function PATCH(
  request: Request,
  { params }: CartItemRouteProps,
) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập" },
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

  const result = updateCartItemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Số lượng không hợp lệ",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { itemId } = await params;
  const { quantity } = result.data;

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const cartItem = await transaction.cartItem.findFirst({
        where: {
          id: itemId,
          userId: session.user.id,
        },
        include: {
          product: {
            select: {
              stock: true,
              isActive: true,
            },
          },
        },
      });

      if (!cartItem) {
        throw new CartRequestError(
          404,
          "Sản phẩm không tồn tại trong giỏ hàng",
        );
      }

      if (!cartItem.product.isActive) {
        throw new CartRequestError(
          409,
          "Sản phẩm đã ngừng bán",
        );
      }

      if (quantity > cartItem.product.stock) {
        throw new CartRequestError(
          409,
          `Chỉ còn ${cartItem.product.stock} sản phẩm trong kho`,
        );
      }

      const updatedCartItem = await transaction.cartItem.update({
        where: {
          id: itemId,
        },
        data: {
          quantity,
        },
      });

      const summary = await transaction.cartItem.aggregate({
        where: {
          userId: session.user.id,
        },
        _sum: {
          quantity: true,
        },
      });

      return {
        cartItem: updatedCartItem,
        totalQuantity: summary._sum.quantity ?? 0,
      };
    });

    return NextResponse.json({
      message: "Đã cập nhật giỏ hàng",
      ...result,
    });
  } catch (error) {
    if (error instanceof CartRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    console.error("Update cart item error:", error);

    return NextResponse.json(
      { message: "Không thể cập nhật giỏ hàng" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: CartItemRouteProps,
) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập" },
      { status: 401 },
    );
  }

  const { itemId } = await params;

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const deleted = await transaction.cartItem.deleteMany({
        where: {
          id: itemId,
          userId: session.user.id,
        },
      });

      if (deleted.count === 0) {
        throw new CartRequestError(
          404,
          "Sản phẩm không tồn tại trong giỏ hàng",
        );
      }

      const summary = await transaction.cartItem.aggregate({
        where: {
          userId: session.user.id,
        },
        _sum: {
          quantity: true,
        },
      });

      return {
        totalQuantity: summary._sum.quantity ?? 0,
      };
    });

    return NextResponse.json({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
      ...result,
    });
  } catch (error) {
    if (error instanceof CartRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    console.error("Delete cart item error:", error);

    return NextResponse.json(
      { message: "Không thể xóa sản phẩm khỏi giỏ hàng" },
      { status: 500 },
    );
  }
}