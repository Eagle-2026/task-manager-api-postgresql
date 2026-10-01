import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(20, "Name cannot exceed 20 characters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please provide a valid email"),

    password: z
      .string()
      .min(
        4,
        "Password must be at least 4 characters",
      ),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please provide a valid email"),

    password: z
      .string()
      .min(1, "Password is required"),
  })
  .strict();

// TypeScript types created automatically from Zod
export type SignupInput =
  z.infer<typeof signupSchema>;

export type LoginInput =
  z.infer<typeof loginSchema>;