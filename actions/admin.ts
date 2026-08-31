"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { sql, queryOne, queryMany } from "@/lib/db";
import { generateSequentialCode } from "@/lib/nfc/card-code";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = await queryOne<{ role: string }>(
    "SELECT role FROM user_roles WHERE user_id = $1",
    [session.userId]
  );

  if (role?.role !== "admin") redirect("/dashboard");

  return session;
}

export async function generateCardsAction(
  _prev: { error?: string; count?: number } | null,
  formData: FormData
): Promise<{ error?: string; count?: number }> {
  await requireAdmin();

  const quantityRaw = parseInt(formData.get("quantity") as string, 10);
  if (isNaN(quantityRaw) || quantityRaw < 1 || quantityRaw > 500) {
    return { error: "Quantity must be between 1 and 500." };
  }

  // Get current max sequence number
  const latestCards = await queryMany<{ card_code: string }>(
    `SELECT card_code FROM cards 
     WHERE card_code ILIKE 'NFC-%' 
     ORDER BY created_at DESC 
     LIMIT 1`
  );

  let nextSeq = 1;
  if (latestCards.length > 0) {
    const lastCode = latestCards[0].card_code;
    const match = lastCode.match(/NFC-(\d+)/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }

  try {
    const values: any[] = [];
    const placeholders = Array.from({ length: quantityRaw }, (_, i) => {
      const code = generateSequentialCode(nextSeq + i);
      const offset = i * 2;
      values.push(code, "inactive");
      return `($${offset + 1}, $${offset + 2})`;
    }).join(", ");

    await sql(
      `INSERT INTO cards (card_code, status) VALUES ${placeholders}`,
      values
    );
  } catch (err) {
    console.error("Bulk generate error:", err);
    return { error: "Failed to generate cards. Some codes may already exist." };
  }

  return { count: quantityRaw };
}

export async function suspendCardAction(cardId: string): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    await sql("UPDATE cards SET status = 'suspended' WHERE id = $1", [cardId]);
    return {};
  } catch (err) {
    return { error: "Failed to suspend card." };
  }
}

export async function activateCardAdminAction(cardId: string): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    await sql("UPDATE cards SET status = 'active' WHERE id = $1 AND owner_id IS NOT NULL", [
      cardId,
    ]);
    return {};
  } catch (err) {
    return { error: "Failed to activate card." };
  }
}

export async function registerCustomCardAction(
  _prev: { error?: string; success?: boolean; code?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; code?: string }> {
  await requireAdmin();

  const codeRaw = (formData.get("cardCode") as string || "").trim().toUpperCase();
  
  if (!codeRaw || codeRaw.length < 3 || codeRaw.length > 50) {
    return { error: "Card code must be between 3 and 50 characters." };
  }

  if (!/^[A-Z0-9_-]+$/.test(codeRaw)) {
    return { error: "Card code can only contain letters, numbers, hyphens, and underscores." };
  }

  // Check if code already exists
  const existing = await queryOne(
    "SELECT id FROM cards WHERE card_code = $1",
    [codeRaw]
  );

  if (existing) {
    return { error: "This card code is already registered in the system." };
  }

  try {
    await sql(
      "INSERT INTO cards (card_code, status) VALUES ($1, 'inactive')",
      [codeRaw]
    );
    return { success: true, code: codeRaw };
  } catch (err) {
    console.error("Register custom card error:", err);
    return { error: "Failed to register custom card code." };
  }
}

export async function getCardIdByCodeAction(cardCode: string): Promise<{ error?: string; id?: string }> {
  await requireAdmin();
  const cleaned = cardCode.trim().toUpperCase();
  const card = await queryOne<{ id: string }>(
    "SELECT id FROM cards WHERE card_code = $1",
    [cleaned]
  );
  if (!card) {
    return { error: "Card code not found." };
  }
  return { id: card.id };
}


