"use server";

import { sql, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { profileBaseSchema, cardActionSchema } from "@/lib/validations/profile";
import { profileLinkSchema } from "@/lib/validations/links";
import { isValidUrl } from "@/lib/utils/url";
import type { ProfileFormData, LinkFormData, ActionFormData, ProfileTemplate } from "@/types";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Validates a card code and returns its current status.
 */
export async function validateCard(cardCode: string): Promise<ActionResult<{
  id: string;
  card_code: string;
  status: string;
}>> {
  const card = await queryOne<{
    id: string;
    card_code: string;
    status: string;
  }>("SELECT id, card_code, status FROM cards WHERE card_code = $1", [
    cardCode.toUpperCase(),
  ]);

  if (!card) {
    return { success: false, error: "Card not found." };
  }

  return { success: true, data: card };
}

/**
 * Activates a card atomically using Neon PostgreSQL.
 */
export async function activateCard(input: {
  cardCode: string;
  template: ProfileTemplate;
  profileData: ProfileFormData;
  links: LinkFormData[];
  action: ActionFormData;
}): Promise<ActionResult<{ profileUsername: string }>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated." };
  }

  // Validate inputs
  const profileParsed = profileBaseSchema.safeParse(input.profileData);
  if (!profileParsed.success) {
    return { success: false, error: "Invalid profile data." };
  }

  const actionParsed = cardActionSchema.safeParse(input.action);
  if (!actionParsed.success) {
    return { success: false, error: "Invalid NFC action configuration." };
  }

  for (const link of input.links) {
    const linkParsed = profileLinkSchema.safeParse(link);
    if (!linkParsed.success) {
      return { success: false, error: `Invalid link: ${link.title}` };
    }
  }

  if (
    actionParsed.data.action_type !== "profile" &&
    actionParsed.data.destination_url
  ) {
    if (
      !isValidUrl(actionParsed.data.destination_url) &&
      !actionParsed.data.destination_url.startsWith("https://wa.me/")
    ) {
      return { success: false, error: "Invalid destination URL." };
    }
  }

  const cardCodeUpper = input.cardCode.toUpperCase();

  // Check card status
  const card = await queryOne<{ id: string; status: string }>(
    "SELECT id, status FROM cards WHERE card_code = $1",
    [cardCodeUpper]
  );

  if (!card) {
    return { success: false, error: "Card not found." };
  }

  if (card.status !== "inactive") {
    return { success: false, error: "This card has already been activated." };
  }

  // Check username availability
  const existingUsername = await queryOne(
    "SELECT id FROM profiles WHERE username = $1",
    [profileParsed.data.username.toLowerCase()]
  );
  if (existingUsername) {
    return { success: false, error: "This username is already taken." };
  }

  try {
    // Create profile
    const profile = await queryOne<{ id: string; username: string }>(
      `INSERT INTO profiles (
        user_id, username, name, bio, template, profession, 
        company_name, industry, location, website_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, username`,
      [
        session.userId,
        profileParsed.data.username.toLowerCase(),
        profileParsed.data.name,
        profileParsed.data.bio ?? null,
        input.template,
        profileParsed.data.profession ?? null,
        profileParsed.data.company_name ?? null,
        profileParsed.data.industry ?? null,
        profileParsed.data.location ?? null,
        profileParsed.data.website_url ?? null,
      ]
    );

    if (!profile) {
      return { success: false, error: "Failed to create profile." };
    }

    // Insert profile links
    if (input.links.length > 0) {
      const values: any[] = [];
      const placeholders = input.links
        .map((link, idx) => {
          const offset = idx * 6;
          values.push(
            profile.id,
            link.type,
            link.title,
            link.url,
            link.is_active,
            link.sort_order ?? idx
          );
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
        })
        .join(", ");

      await sql(
        `INSERT INTO profile_links (profile_id, type, title, url, is_active, sort_order) VALUES ${placeholders}`,
        values
      );
    }

    // Atomically claim the card
    const updatedCard = await queryOne<{ id: string }>(
      `UPDATE cards 
       SET owner_id = $1, profile_id = $2, status = 'active', activated_at = NOW() 
       WHERE card_code = $3 AND status = 'inactive'
       RETURNING id`,
      [session.userId, profile.id, cardCodeUpper]
    );

    if (!updatedCard) {
      // Rollback: delete the profile we created
      await sql("DELETE FROM profiles WHERE id = $1", [profile.id]);
      return {
        success: false,
        error: "This card was activated by someone else. Please try again.",
      };
    }

    // Create card action
    const destinationUrl =
      actionParsed.data.action_type === "profile"
        ? null
        : actionParsed.data.destination_url ?? null;

    await sql(
      `INSERT INTO card_actions (card_id, action_type, destination_url, is_active)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (card_id) DO UPDATE 
       SET action_type = EXCLUDED.action_type, destination_url = EXCLUDED.destination_url, is_active = EXCLUDED.is_active`,
      [updatedCard.id, actionParsed.data.action_type, destinationUrl, true]
    );

    return {
      success: true,
      data: { profileUsername: profile.username },
    };
  } catch (err) {
    console.error("Activation failed:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Updates the NFC action for an already-activated card.
 */
export async function updateCardAction(input: {
  cardId: string;
  action: ActionFormData;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated." };
  }

  const actionParsed = cardActionSchema.safeParse(input.action);
  if (!actionParsed.success) {
    return { success: false, error: "Invalid action data." };
  }

  // Verify ownership
  const card = await queryOne<{ id: string }>(
    "SELECT id FROM cards WHERE id = $1 AND owner_id = $2",
    [input.cardId, session.userId]
  );

  if (!card) {
    return { success: false, error: "Card not found or access denied." };
  }

  const destinationUrl =
    actionParsed.data.action_type === "profile"
      ? null
      : actionParsed.data.destination_url ?? null;

  try {
    await sql(
      `INSERT INTO card_actions (card_id, action_type, destination_url, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (card_id) DO UPDATE 
       SET action_type = EXCLUDED.action_type, destination_url = EXCLUDED.destination_url, updated_at = NOW()`,
      [card.id, actionParsed.data.action_type, destinationUrl]
    );
    return { success: true };
  } catch (err) {
    console.error("Update card action error:", err);
    return { success: false, error: "Failed to update NFC action." };
  }
}
