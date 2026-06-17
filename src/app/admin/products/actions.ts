"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export async function updateProductInventory(formData: FormData) {
  await requireAdmin();

  const productId = formData.get("productId");
  const stockValue = formData.get("stock");
  const isActiveValue = formData.get("isActive");

  if (typeof productId !== "string" || productId.length === 0) {
    throw new Error("Product id không hợp lệ");
  }

  if (typeof stockValue !== "string") {
    throw new Error("Số lượng tồn kho không hợp lệ");
  }

  const stock = Number(stockValue);

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Số lượng tồn kho phải là số nguyên không âm");
  }

  const product = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      stock,
      isActive: isActiveValue === "on",
    },
    select: {
      slug: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
}