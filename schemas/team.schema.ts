import { z } from "zod";

export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Team name is required")
    .max(100, "Team name must not exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .default(""),
});

export type TeamInput = z.input<typeof teamSchema>;
export type TeamOutput = z.output<typeof teamSchema>;
