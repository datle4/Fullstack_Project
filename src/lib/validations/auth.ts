import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Tên phải có ít nhất 2 ký tự")
      .max(80, "Tên không được vượt quá 80 ký tự"),

    email: z
      .string()
      .trim()
      .email("Email không hợp lệ")
      .max(254, "Email quá dài"),

    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .max(72, "Mật khẩu không được vượt quá 72 ký tự")
      .regex(/[A-Za-z]/, "Mật khẩu phải có ít nhất một chữ cái")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất một chữ số"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;