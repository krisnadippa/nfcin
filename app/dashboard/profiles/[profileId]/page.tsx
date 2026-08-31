import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { queryOne } from "@/lib/db";
import { ProfileEditorClient } from "./profile-editor-client";

interface Props {
  params: Promise<{ profileId: string }>;
}

interface ProfileRow {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  profession: string | null;
  company_name: string | null;
  industry: string | null;
  location: string | null;
  website_url: string | null;
  template: string;
}

export default async function ProfileDetailPage({ params }: Props) {
  const { profileId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await queryOne<ProfileRow>(
    "SELECT * FROM profiles WHERE id = $1 AND user_id = $2",
    [profileId, session.userId]
  );

  if (!profile) notFound();

  return <ProfileEditorClient profile={profile} />;
}
