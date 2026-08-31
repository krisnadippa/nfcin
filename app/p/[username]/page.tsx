import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { queryOne, queryMany, sql } from "@/lib/db";
import { getLinkIcon } from "@/constants/link-types";
import { TEMPLATE_MAP } from "@/constants/templates";
import { getProfileUrl } from "@/lib/utils/url";
import { MapPin, Globe } from "lucide-react";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const profile = await queryOne<{
    name: string;
    bio: string | null;
    company_name: string | null;
    template: string;
  }>("SELECT name, bio, company_name, template FROM profiles WHERE username = $1", [
    username.toLowerCase(),
  ]);

  if (!profile) return { title: "Profile Not Found" };

  const displayName =
    profile.template === "company" ? profile.company_name : profile.name;

  return {
    title: `${displayName} (@${username})`,
    description: profile.bio ?? `${displayName}'s digital profile`,
    openGraph: {
      title: `${displayName} (@${username})`,
      description: profile.bio ?? `${displayName}'s digital profile`,
      url: getProfileUrl(username),
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${displayName} (@${username})`,
      description: profile.bio ?? undefined,
    },
    alternates: {
      canonical: getProfileUrl(username),
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const usernameLower = username.toLowerCase();

  // Fetch profile
  const profile = await queryOne<{
    id: string;
    username: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
    template: string;
    profession: string | null;
    company_name: string | null;
    industry: string | null;
    location: string | null;
    website_url: string | null;
  }>("SELECT * FROM profiles WHERE username = $1", [usernameLower]);

  if (!profile) notFound();

  // Fetch links
  const links = await queryMany<{
    id: string;
    type: string;
    title: string;
    url: string;
    is_active: boolean;
    sort_order: number;
  }>(
    "SELECT id, type, title, url, is_active, sort_order FROM profile_links WHERE profile_id = $1 AND is_active = true ORDER BY sort_order ASC",
    [profile.id]
  );

  const templateConfig = TEMPLATE_MAP[profile.template as keyof typeof TEMPLATE_MAP];
  const displayName =
    profile.template === "company"
      ? profile.company_name ?? profile.name
      : profile.name;

  // Record profile view (fire and forget)
  sql(
    "INSERT INTO analytics_events (profile_id, event_type) VALUES ($1, 'profile_view')",
    [profile.id]
  ).catch((e) => console.error("Analytics view error:", e));

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-sm mx-auto px-4 py-12">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName ?? ""}
              width={80}
              height={80}
              className="rounded-full object-cover border"
              style={{ borderColor: "var(--color-border)" }}
            />
          ) : (
            <div
              className="size-20 rounded-full border flex items-center justify-center"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <span
                className="text-[2rem] font-semibold"
                style={{ color: "var(--color-muted)" }}
              >
                {(displayName ?? "?").charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Name */}
          <h1
            className="text-[1.125rem] font-semibold text-center mt-3 mb-0.5"
            style={{ color: "var(--color-fg)" }}
          >
            {displayName}
          </h1>

          {/* Profession */}
          {profile.profession && (
            <p
              className="text-[0.875rem] text-center"
              style={{ color: "var(--color-secondary)" }}
            >
              {profile.profession}
            </p>
          )}

          {/* Industry for company */}
          {profile.industry && (
            <p
              className="text-[0.8125rem] text-center"
              style={{ color: "var(--color-muted)" }}
            >
              {profile.industry}
            </p>
          )}

          {/* Location */}
          {profile.location && (
            <div
              className="flex items-center gap-1 mt-1"
              style={{ color: "var(--color-muted)" }}
            >
              <MapPin size={13} strokeWidth={1.5} />
              <span className="text-caption">{profile.location}</span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p
              className="text-[0.875rem] text-center mt-3 leading-relaxed"
              style={{ color: "var(--color-secondary)" }}
            >
              {profile.bio}
            </p>
          )}

          {/* Website */}
          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 mt-2 text-[0.8125rem] no-underline hover:underline"
              style={{ color: "var(--color-secondary)" }}
            >
              <Globe size={13} strokeWidth={1.5} />
              {profile.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          )}
        </div>

        {/* Divider */}
        <div className="divider mb-6" />

        {/* Links */}
        <div className="flex flex-col gap-2.5">
          {links.map((link) => {
            const Icon = getLinkIcon(link.type);
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-lg)] border no-underline transition-base hover:shadow-md"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-fg)",
                }}
              >
                <div
                  className="flex items-center justify-center size-8 rounded-[var(--radius-md)] border shrink-0"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} style={{ color: "var(--color-secondary)" }} />
                </div>
                <span className="font-medium text-[0.875rem]">{link.title}</span>
              </a>
            );
          })}
        </div>

        {links.length === 0 && (
          <p className="text-caption text-center py-6">
            No links yet.
          </p>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-caption">
            Powered by{" "}
            <a
              href="/"
              className="text-[var(--color-fg)] font-medium no-underline hover:underline"
            >
              NFC Smart Profile
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
