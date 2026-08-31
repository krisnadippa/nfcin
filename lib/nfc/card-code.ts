import { customAlphabet } from "nanoid";

// Alphabet: uppercase letters + digits, excluding ambiguous chars (0,O,I,1)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const nanoid = customAlphabet(ALPHABET, 6);

/**
 * Generates a unique card code in the format NFC-XXXXXX
 * Uses unambiguous characters to avoid confusion when reading the code.
 */
export function generateCardCode(): string {
  return `NFC-${nanoid()}`;
}

/**
 * Generates a sequential card code for bulk generation.
 * Format: NFC-000001, NFC-000002, ...
 */
export function generateSequentialCode(sequence: number): string {
  return `NFC-${String(sequence).padStart(6, "0")}`;
}

/**
 * Validates a card code format.
 */
export function isValidCardCode(code: string): boolean {
  return /^NFC-[A-Z0-9]{4,8}$/.test(code);
}
