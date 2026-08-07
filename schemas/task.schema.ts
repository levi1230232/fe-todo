import { z } from "zod";
import { Priority, TaskStatus, WorkspaceStyle } from "@/types/task";

export const createTaskSchema = z
  .object({
    title: z
      .string({
        message: "Task title is required",
      })
      .trim()
      .min(1, "Task title cannot be empty")
      .max(255, "Task title must not exceed 255 characters"),

    description: z.string().trim().optional(),

    priority: z.nativeEnum(Priority, {
      message: "Please select a valid priority level",
    }),

    status: z.nativeEnum(TaskStatus, {
      message: "Please select a valid status",
    }),

    dueTo: z.string().min(1, "Due date is required"),

    reminder: z
      .number({
        message: "Reminder is required",
      })
      .int("Reminder must be an integer")
      .min(0, "Reminder cannot be negative"),

    workspaceStyle: z.nativeEnum(WorkspaceStyle, {
      message: "Please select a workspace style",
    }),

    teamId: z.number().int().positive("Invalid Team ID").optional().nullable(),

    categoryId: z
      .number()
      .int()
      .positive("Invalid Category ID")
      .optional()
      .nullable(),

    assignedTo: z.number().int().positive("AssignedTo is required").optional(),
    tagIds: z.array(z.number().int()).optional(),
  })
  .refine(
    (data) => {
      if (data.workspaceStyle === WorkspaceStyle.TEAM) {
        return data.teamId != null;
      }
      return true;
    },
    {
      path: ["teamId"],
      message: "Team selection is required for team tasks",
    },
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
