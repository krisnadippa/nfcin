import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "nfc_session";
const ALGORITHM = "AES-GCM";

interface SessionData {
  userId: string;
  email: string;
  role: string;
  expiresAt: string;
}

// Convert a string to an array buffer
function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// Helper to get raw key
async function getRawKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("nfc-smart-profile-salt-string"),
      iterations: 1000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a payload into a secure token string using standard Web Crypto.
 */
export async function encryptSession(data: any): Promise<string> {
  const secret = process.env.SESSION_SECRET || "fallback-secret-at-least-32-chars-long";
  const rawKey = await getRawKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encodedData = enc.encode(JSON.stringify(data));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    rawKey,
    encodedData
  );

  // Combine iv and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a token back into the payload using standard Web Crypto.
 */
export async function decryptSession(token: string): Promise<any | null> {
  try {
    const secret = process.env.SESSION_SECRET || "fallback-secret-at-least-32-chars-long";
    const rawKey = await getRawKey(secret);
    
    const binary = atob(token);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      rawKey,
      encryptedData
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (err) {
    return null;
  }
}

/**
 * Sets the session cookie.
 */
export async function setSession(data: { userId: string; email: string; role: string }) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const payload: SessionData = {
    ...data,
    expiresAt: expiresAt.toISOString(),
  };

  const encrypted = await encryptSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Gets the current session from cookie.
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const data = (await decryptSession(token)) as SessionData | null;
  if (!data) return null;

  // Check expiration
  if (new Date(data.expiresAt) < new Date()) {
    await clearSession();
    return null;
  }

  return data;
}

/**
 * Clears the session cookie.
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
