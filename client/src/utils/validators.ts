import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required.")
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must include a letter and a number.")
});

export const uploadSchema = z.object({
  title: z.string().min(1, "Title is required.").max(120),
  description: z.string().max(1000).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).default("PRIVATE"),
  tags: z.string().max(800, "Tags must be shorter than 800 characters.").optional()
});

export const photoMetadataSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"])
});

export const albumSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"])
});
