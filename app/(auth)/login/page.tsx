"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="surface p-8">
      <div className="mb-7">
        <h1 className="text-subheading mb-1">Welcome back</h1>
        <p className="text-caption">Sign in to your NFC Smart Profile account.</p>
      </div>

      {message === "check-email" && (
        <div
          className="mb-5 rounded-[var(--radius-md)] border p-3 text-[0.8125rem]"
          style={{
            borderColor: "#BBF7D0",
            backgroundColor: "var(--color-success-bg)",
            color: "var(--color-success)",
          }}
        >
          Check your email to confirm your account before logging in.
        </div>
      )}

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
          placeholder="••••••••"
          autoComplete="current-password"
          required
          error={state?.fieldErrors?.password?.[0]}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="remember"
              className="rounded"
            />
            <span className="text-caption">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-caption underline underline-offset-2 hover:text-[var(--color-fg)] transition-base"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={pending} fullWidth className="mt-1">
          Sign in
        </Button>
      </form>

      <p className="text-caption text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[var(--color-fg)] font-medium underline underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
