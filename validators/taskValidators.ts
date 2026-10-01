import { z } from "zod";

// ========================================
// CREATE TASK
// ========================================
export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(
        100,
        "Title cannot exceed 100 characters",
      ),

    description: z
      .string()
      .trim()
      .max(
        500,
        "Description cannot exceed 500 characters",
      )
      .optional(),

    completed: z
      .boolean()
      .optional(),
  })
  .strict();

// ========================================
// UPDATE TASK
// ========================================
export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(
        100,
        "Title cannot exceed 100 characters",
      )
      .optional(),

    description: z
      .string()
      .trim()
      .max(
        500,
        "Description cannot exceed 500 characters",
      )
      .optional(),

    completed: z
      .boolean()
      .optional(),
  })
  .strict();

// ========================================
// TYPES GENERATED FROM ZOD
// ========================================
export type CreateTaskInput =
  z.infer<typeof createTaskSchema>;

export type UpdateTaskInput =
  z.infer<typeof updateTaskSchema>;