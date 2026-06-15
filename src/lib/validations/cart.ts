import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "Thiếu mã sản phẩm"),
  quantity: z
    .number()
    .int("Số lượng phải là số nguyên")
    .min(1, "Số lượng tối thiểu là 1")
    .max(99, "Số lượng tối đa là 99"),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Số lượng phải là số nguyên")
    .min(1, "Số lượng tối thiểu là 1")
    .max(99, "Số lượng tối đa là 99"),
});

export type UpdateCartItemInput = z.infer<
  typeof updateCartItemSchema
>;