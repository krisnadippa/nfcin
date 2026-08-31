import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { queryOne, queryMany } from "@/lib/db";
import { LinksManagerClient } from "./links-manager-client";
import { Link2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Links" };

interface ProfileRow {
  id: string;
  username: string;
  name: string;
  company_name: string | null;
  template: string;
}

interface LinkRow {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}

export default async function LinksPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch the first profile of the user using Neon
  const profile = await queryOne<ProfileRow>(
    "SELECT id, username, name, company_name, template FROM profiles WHERE user_id = $1 LIMIT 1",
    [session.userId]
  );

  if (!profile) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <div>
          <h2 className="text-heading">Links</h2>
          <p className="text-body mt-0.5">Manage your profile links.</p>
        </div>
        <div className="surface">
          <EmptyState
            icon={Link2}
            title="No profiles yet"
            description="Activate a card to create a profile and start adding links."
          />
        </div>
      </div>
    );
  }

  // Fetch links for this profile using Neon
  const links = await queryMany<LinkRow>(
    "SELECT id, profile_id, type, title, url, is_active, sort_order FROM profile_links WHERE profile_id = $1 ORDER BY sort_order ASC",
    [profile.id]
  );

  const displayName =
    profile.template === "company"
      ? profile.company_name ?? profile.name
      : profile.name;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-heading">Links</h2>
        <p className="text-body mt-0.5">
          Managing links for {displayName} (@{profile.username})
        </p>
      </div>
      <LinksManagerClient profileId={profile.id} initialLinks={links} />
    </div>
  );
}
