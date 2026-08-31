"use client";

import { useState, useTransition } from "react";
import { updateProfileSettingsAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutAction } from "@/actions/auth";

interface Profile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
}

interface SettingsClientProps {
  user: { id: string; email: string };
  profile: Profile | null;
}

export function SettingsClient({ user, profile }: SettingsClientProps) {
  const [name, setName] = useState(profile?.name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!profile) return;
    setError(null);
    startTransition(async () => {
      const result = await updateProfileSettingsAction(profile.id, name, bio);

      if (!result.success) {
        setError(result.error ?? "Failed to save settings.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h2 className="text-heading">Settings</h2>
        <p className="text-body mt-0.5">Manage your account preferences.</p>
      </div>

      {/* Profile settings */}
      <div className="surface p-5 flex flex-col gap-4">
        <p className="text-label">Profile Settings</p>
        <div className="divider" />
        <Input
          label="Display Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-label">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 py-2.5 text-[0.875rem] text-[var(--color-fg)] placeholder:text-[var(--color-muted)] transition-base outline-none resize-none border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
          />
        </div>
        {error && (
          <p className="text-caption" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={isPending} disabled={!profile}>
            Save Changes
          </Button>
          {saved && (
            <span className="text-caption" style={{ color: "var(--color-success)" }}>
              Saved.
            </span>
          )}
        </div>
      </div>

      {/* Account settings */}
      <div className="surface p-5 flex flex-col gap-4">
        <p className="text-label">Account</p>
        <div className="divider" />
        <div>
          <p className="text-caption mb-1">Email</p>
          <p className="text-label">{user.email}</p>
        </div>
        {profile && (
          <div>
            <p className="text-caption mb-1">Username</p>
            <p className="text-label">@{profile.username}</p>
          </div>
        )}
        <form action={logoutAction} className="mt-1">
          <Button type="submit" variant="secondary" size="sm">
            Log out
          </Button>
        </form>
      </div>
    </div>
  );
}
