import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Tên người nhận phải có ít nhất 2 ký tự")
    .max(80, "Tên người nhận không được vượt quá 80 ký tự"),

  phone: z
    .string()
    .trim()
    .min(9, "Số điện thoại không hợp lệ")
    .max(15, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+\s-]+$/, "Số điện thoại không hợp lệ"),

  address: z
    .string()
    .trim()
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),

  note: z
    .string()
    .trim()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;