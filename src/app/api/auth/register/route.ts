import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { createSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Dữ liệu đăng ký không hợp lệ",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, password } = result.data;
    const email = result.data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email đã được sử dụng" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json(
      {
        message: "Đăng ký thành công",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Email đã được sử dụng" },
        { status: 409 },
      );
    }

    console.error("Register error:", error);

    return NextResponse.json(
      { message: "Không thể đăng ký tài khoản" },
      { status: 500 },
    );
  }
}