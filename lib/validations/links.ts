import { z } from "zod";

export const profileLinkSchema = z.object({
  type: z.string().min(1, { message: "Link type is required." }),
  title: z
    .string()
    .min(1, { message: "Title is required." })
    .max(60, { message: "Title must be 60 characters or less." })
    .trim(),
  url: z
    .string()
    .min(1, { message: "URL is required." })
    .refine(
      (val) => {
        if (val.startsWith("mailto:") || val.startsWith("tel:")) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Enter a valid URL." }
    ),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export type ProfileLinkInput = z.infer<typeof profileLinkSchema>;
