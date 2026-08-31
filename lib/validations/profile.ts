import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, { message: "Username must be at least 3 characters." })
  .max(30, { message: "Username must be 30 characters or less." })
  .regex(/^[a-z0-9._-]+$/, {
    message: "Username can only contain lowercase letters, numbers, dots, underscores, and hyphens.",
  })
  .trim();

export const profileBaseSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(100, { message: "Name is too long." })
    .trim(),
  username: usernameSchema,
  bio: z.string().max(300, { message: "Bio must be 300 characters or less." }).optional(),
  profession: z.string().max(100).optional(),
  company_name: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  website_url: z
    .string()
    .url({ message: "Enter a valid URL." })
    .optional()
    .or(z.literal("")),
});

export const cardActionSchema = z.object({
  action_type: z.enum(["profile", "instagram", "whatsapp", "website", "tiktok", "youtube", "linkedin", "custom"]),
  destination_url: z
    .string()
    .url({ message: "Enter a valid URL." })
    .optional()
    .or(z.literal(""))
    .or(z.undefined()),
});

export type ProfileBaseInput = z.infer<typeof profileBaseSchema>;
export type CardActionInput = z.infer<typeof cardActionSchema>;
