"use server";

import { getSession } from "@/lib/auth/session";
import { sql, queryOne } from "@/lib/db";
import { profileLinkSchema } from "@/lib/validations/links";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Helper to verify user owns the profile
async function verifyProfileOwner(profileId: string, userId: string): Promise<boolean> {
  const profile = await queryOne(
    "SELECT id FROM profiles WHERE id = $1 AND user_id = $2",
    [profileId, userId]
  );
  return !!profile;
}

export async function addLinkAction(input: {
  profileId: string;
  type: string;
  title: string;
  url: string;
  sortOrder: number;
}): Promise<ActionResult<any>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated." };

  const isOwner = await verifyProfileOwner(input.profileId, session.userId);
  if (!isOwner) return { success: false, error: "Access denied." };

  const parsed = profileLinkSchema.safeParse({
    type: input.type,
    title: input.title,
    url: input.url,
    is_active: true,
    sort_order: input.sortOrder,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors[0] || "Invalid link data." };
  }

  try {
    const link = await queryOne(
      `INSERT INTO profile_links (profile_id, type, title, url, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.profileId,
        parsed.data.type,
        parsed.data.title,
        parsed.data.url,
        true,
        parsed.data.sort_order,
      ]
    );

    return { success: true, data: link };
  } catch (err) {
    console.error("Add link error:", err);
    return { success: false, error: "Failed to add link." };
  }
}

export async function deleteLinkAction(linkId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated." };

  try {
    // Verify ownership through join
    const ownedLink = await queryOne(
      `SELECT pl.id FROM profile_links pl
       JOIN profiles p ON p.id = pl.profile_id
       WHERE pl.id = $1 AND p.user_id = $2`,
      [linkId, session.userId]
    );

    if (!ownedLink) return { success: false, error: "Link not found or access denied." };

    await sql("DELETE FROM profile_links WHERE id = $1", [linkId]);
    return { success: true };
  } catch (err) {
    console.error("Delete link error:", err);
    return { success: false, error: "Failed to delete link." };
  }
}

export async function toggleLinkActiveAction(
  linkId: string,
  isActive: boolean
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated." };

  try {
    const ownedLink = await queryOne(
      `SELECT pl.id FROM profile_links pl
       JOIN profiles p ON p.id = pl.profile_id
       WHERE pl.id = $1 AND p.user_id = $2`,
      [linkId, session.userId]
    );

    if (!ownedLink) return { success: false, error: "Link not found or access denied." };

    await sql("UPDATE profile_links SET is_active = $1 WHERE id = $2", [
      isActive,
      linkId,
    ]);
    return { success: true };
  } catch (err) {
    console.error("Toggle link error:", err);
    return { success: false, error: "Failed to update link." };
  }
}
