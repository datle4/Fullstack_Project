import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Dữ liệu đăng nhập không hợp lệ",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const email = result.data.email.toLowerCase();
    const { password } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không chính xác" },
        { status: 401 },
      );
    }

    const passwordMatches = await verifyPassword(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không chính xác" },
        { status: 401 },
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Không thể đăng nhập" },
      { status: 500 },
    );
  }
}