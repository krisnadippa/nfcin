"use server";

import { getSession } from "@/lib/auth/session";
import { sql, queryOne } from "@/lib/db";
import { profileBaseSchema } from "@/lib/validations/profile";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function updateProfileAction(
  profileId: string,
  data: {
    name: string;
    bio: string;
    profession: string;
    company_name: string;
    industry: string;
    location: string;
    website_url: string;
  }
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated." };
  }

  // Verify ownership of the profile
  const profile = await queryOne(
    "SELECT id FROM profiles WHERE id = $1 AND user_id = $2",
    [profileId, session.userId]
  );
  if (!profile) {
    return { success: false, error: "Profile not found or access denied." };
  }

  try {
    await sql(
      `UPDATE profiles
       SET name = $1, 
           bio = $2, 
           profession = $3, 
           company_name = $4, 
           industry = $5, 
           location = $6, 
           website_url = $7,
           updated_at = NOW()
       WHERE id = $8`,
      [
        data.name,
        data.bio || null,
        data.profession || null,
        data.company_name || null,
        data.industry || null,
        data.location || null,
        data.website_url || null,
        profileId,
      ]
    );

    return { success: true };
  } catch (err) {
    console.error("Update profile error:", err);
    return { success: false, error: "Failed to update profile." };
  }
}

export async function updateProfileSettingsAction(
  profileId: string,
  name: string,
  bio: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated." };
  }

  // Verify ownership
  const profile = await queryOne(
    "SELECT id FROM profiles WHERE id = $1 AND user_id = $2",
    [profileId, session.userId]
  );
  if (!profile) {
    return { success: false, error: "Profile not found or access denied." };
  }

  try {
    await sql(
      `UPDATE profiles
       SET name = $1, bio = $2, updated_at = NOW()
       WHERE id = $3`,
      [name, bio || null, profileId]
    );
    return { success: true };
  } catch (err) {
    console.error("Update settings error:", err);
    return { success: false, error: "Failed to save settings." };
  }
}

