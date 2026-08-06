import { z } from "zod";

export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên nhóm không được để trống")
    .max(100, "Tên nhóm không được vượt quá 100 ký tự"),

  description: z
    .string()
    .trim()
    .max(500, "Mô tả không được vượt quá 500 ký tự")
    .optional()
    .default(""),
});

export type TeamInput = z.input<typeof teamSchema>;
export type TeamOutput = z.output<typeof teamSchema>;
