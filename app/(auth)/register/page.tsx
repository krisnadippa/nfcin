"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, null);

  return (
    <div className="surface p-8">
      <div className="mb-7">
        <h1 className="text-subheading mb-1">Create your account</h1>
        <p className="text-caption">Set up NFC Smart Profile in minutes.</p>
      </div>

      {state?.error && (
        <div
          className="mb-5 rounded-[var(--radius-md)] border p-3 text-[0.8125rem]"
          style={{
            borderColor: "#FECACA",
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger)",
          }}
        >
          {state.error}
        </div>
      )}

      <form action={action} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
          error={state?.fieldErrors?.name?.[0]}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          error={state?.fieldErrors?.email?.[0]}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          error={state?.fieldErrors?.password?.[0]}
        />
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
          error={state?.fieldErrors?.confirmPassword?.[0]}
        />

        <Button type="submit" loading={pending} fullWidth className="mt-1">
          Create Account
        </Button>
      </form>

      <p className="text-caption text-center mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--color-fg)] font-medium underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
