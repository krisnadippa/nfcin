import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { queryOne } from "@/lib/db";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Settings" };

interface ProfileRow {
  id: string;
  name: string;
  username: string;
  bio: string | null;
}

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await queryOne<ProfileRow>(
    "SELECT id, name, username, bio FROM profiles WHERE user_id = $1 LIMIT 1",
    [session.userId]
  );

  return (
    <SettingsClient
      user={{ id: session.userId, email: session.email }}
      profile={profile}
    />
  );
}
