import { NextResponse } from "next/server";
import { deleteCurrentSession } from "@/lib/auth/session";

export async function POST() {
  await deleteCurrentSession();

  return NextResponse.json({
    message: "Đăng xuất thành công",
  });
}