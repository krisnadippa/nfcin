import { redirect } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { queryMany } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { TEMPLATE_MAP } from "@/constants/templates";

export const metadata = { title: "Profiles" };

interface ProfileRow {
  id: string;
  username: string;
  name: string;
  template: string;
  company_name: string | null;
}

export default async function ProfilesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profiles = await queryMany<ProfileRow>(
    "SELECT id, username, name, template, company_name FROM profiles WHERE user_id = $1",
    [session.userId]
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-heading">Profiles</h2>
        <p className="text-body mt-0.5">
          {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={User}
            title="No profiles yet"
            description="Profiles are created during card activation."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {profiles.map((profile) => {
            const templateConfig = TEMPLATE_MAP[profile.template as keyof typeof TEMPLATE_MAP];
            const displayName =
              profile.template === "company"
                ? profile.company_name ?? profile.name
                : profile.name;

            return (
              <div key={profile.id} className="surface p-4 flex items-center gap-4">
                <div
                  className="size-10 rounded-full border flex items-center justify-center shrink-0 font-semibold text-[0.875rem]"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-secondary)",
                  }}
                >
                  {(displayName ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label truncate">{displayName}</p>
                  <p className="text-caption">
                    @{profile.username} &middot; {templateConfig?.label ?? profile.template}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/p/${profile.username}`} target="_blank">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                  <Link href={`/dashboard/profiles/${profile.id}`}>
                    <Button variant="secondary" size="sm">Edit</Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
