"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

interface Profile {
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

export function ProfileEditorClient({ profile }: { profile: Profile }) {
  const [data, setData] = useState({
    name: profile.name ?? "",
    bio: profile.bio ?? "",
    profession: profile.profession ?? "",
    company_name: profile.company_name ?? "",
    industry: profile.industry ?? "",
    location: profile.location ?? "",
    website_url: profile.website_url ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateProfileAction(profile.id, data);

      if (!result.success) {
        setError(result.error ?? "Failed to save changes. Please try again.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <Link
        href="/dashboard/profiles"
        className="flex items-center gap-2 text-caption hover:text-[var(--color-fg)] transition-base no-underline w-fit"
      >
        <ArrowLeft size={14} />
        Back to Profiles
      </Link>

      <div>
        <h2 className="text-heading">Edit Profile</h2>
        <p className="text-body mt-0.5">@{profile.username}</p>
      </div>

      <div className="surface p-5 flex flex-col gap-4">
        {profile.template === "company" && (
          <Input
            label="Company Name"
            value={data.company_name}
            onChange={(e) => setData({ ...data, company_name: e.target.value })}
          />
        )}
        <Input
          label="Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        <Textarea
          label="Bio"
          value={data.bio}
          onChange={(e) => setData({ ...data, bio: e.target.value })}
        />
        {["personal", "cv", "portfolio"].includes(profile.template) && (
          <Input
            label="Profession / Title"
            value={data.profession}
            onChange={(e) => setData({ ...data, profession: e.target.value })}
          />
        )}
        {profile.template === "company" && (
          <Input
            label="Industry"
            value={data.industry}
            onChange={(e) => setData({ ...data, industry: e.target.value })}
          />
        )}
        <Input
          label="Location"
          value={data.location}
          onChange={(e) => setData({ ...data, location: e.target.value })}
        />
        <Input
          label="Website"
          type="url"
          value={data.website_url}
          onChange={(e) => setData({ ...data, website_url: e.target.value })}
          placeholder="https://"
        />

        {error && (
          <p className="text-caption" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1">
          <Button onClick={handleSave} loading={isPending}>
            Save Changes
          </Button>
          {saved && (
            <span className="text-caption" style={{ color: "var(--color-success)" }}>
              Saved successfully.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
