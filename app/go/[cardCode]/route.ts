import { type NextRequest } from "next/server";
import { queryOne, sql } from "@/lib/db";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/go/[cardCode]">
) {
  const { cardCode } = await ctx.params;

  // Look up card, action, and profile in Neon with a single JOIN query for speed!
  const data = await queryOne<{
    card_id: string;
    card_code: string;
    status: string;
    profile_id: string | null;
    username: string | null;
    action_type: string | null;
    destination_url: string | null;
    is_active: boolean | null;
  }>(
    `SELECT 
      c.id AS card_id, 
      c.card_code, 
      c.status, 
      c.profile_id,
      p.username,
      ca.action_type,
      ca.destination_url,
      ca.is_active
     FROM cards c
     LEFT JOIN profiles p ON p.id = c.profile_id
     LEFT JOIN card_actions ca ON ca.card_id = c.id
     WHERE c.card_code = $1`,
    [cardCode.toUpperCase()]
  );

  if (!data) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/not-found`,
      },
    });
  }

  if (data.status === "inactive" || data.status === "suspended") {
    return Response.redirect(
      new URL(`/go/${cardCode}/inactive`, request.url),
      302
    );
  }

  // Record the tap event (fire and forget to keep redirect fast)
  const ipRaw =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const ipHash = await hashIp(ipRaw);

  sql(
    `INSERT INTO analytics_events (card_id, profile_id, event_type, destination, user_agent, ip_hash, referrer)
     VALUES ($1, $2, 'tap', $3, $4, $5, $6)`,
    [
      data.card_id,
      data.profile_id,
      data.destination_url ?? null,
      request.headers.get("user-agent") ?? null,
      ipHash,
      request.headers.get("referer") ?? null,
    ]
  ).catch((e) => console.error("Analytics insert error:", e));

  // Resolve redirect destination
  if (!data.action_type || !data.is_active) {
    // Default fallback: go to profile
    if (data.username) {
      return Response.redirect(
        new URL(`/p/${data.username}`, request.url),
        302
      );
    }
    return Response.redirect(new URL("/", request.url), 302);
  }

  if (data.action_type === "profile" || !data.destination_url) {
    if (data.username) {
      return Response.redirect(
        new URL(`/p/${data.username}`, request.url),
        302
      );
    }
    return Response.redirect(new URL("/", request.url), 302);
  }

  // Validate destination URL before redirecting
  try {
    const dest = new URL(data.destination_url);
    if (dest.protocol !== "http:" && dest.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
    return Response.redirect(data.destination_url, 302);
  } catch {
    return Response.redirect(new URL("/", request.url), 302);
  }
}

async function hashIp(ip: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(ip);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "unknown";
  }
}
