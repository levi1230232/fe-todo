import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên danh mục không được để trống")
    .max(50, "Tên danh mục không được vượt quá 50 ký tự"),

  description: z
    .string()
    .trim()
    .max(255, "Mô tả không được vượt quá 255 ký tự")
    .optional()
    .default(""),

  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Mã màu HEX không hợp lệ")
    .default("#3B82F6"),
});

export type CategoryInput = z.input<typeof categorySchema>;
export type CategoryOutput = z.output<typeof categorySchema>;
