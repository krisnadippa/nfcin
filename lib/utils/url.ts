/**
 * Validates that a string is a well-formed URL with http/https protocol.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL — returns null if invalid.
 */
export function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!isValidUrl(trimmed)) return null;
  return trimmed;
}

/**
 * Builds the WhatsApp deep-link from a phone number and optional message.
 */
export function buildWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const base = `https://wa.me/${cleaned}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

/**
 * Returns the NFC tap URL for a given card code.
 */
export function getNfcUrl(cardCode: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/go/${cardCode}`;
}

/**
 * Returns the activation URL for a given card code.
 */
export function getActivationUrl(cardCode: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/activate/${cardCode}`;
}

/**
 * Returns the public profile URL for a given username.
 */
export function getProfileUrl(username: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/p/${username}`;
}
