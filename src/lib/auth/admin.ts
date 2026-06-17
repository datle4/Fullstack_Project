import "server-only";

import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";

export async function requireAdmin() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session.user;
}