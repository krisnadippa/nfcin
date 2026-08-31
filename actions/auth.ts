"use server";

import { redirect } from "next/navigation";
import { queryOne, sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { setSession, clearSession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

type ActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const loginData = parsed.data as any;

  // Look up user in Neon
  const user = await queryOne<{
    id: string;
    email: string;
    password_hash: string;
    role: string | null;
  }>(
    `SELECT u.id, u.email, u.password_hash, ur.role 
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     WHERE u.email = $1`,
    [loginData.email.toLowerCase()]
  );

  if (!user || !verifyPassword(loginData.password, user.password_hash)) {
    return { error: "Invalid email or password." };
  }

  // Set the session cookie
  await setSession({
    userId: user.id,
    email: user.email,
    role: user.role ?? "customer",
  });

  redirect("/dashboard");
}

export async function registerAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const registerData = parsed.data as any;
  const emailLower = registerData.email.toLowerCase();

  // Check if email already exists
  const existingUser = await queryOne(
    "SELECT id FROM users WHERE email = $1",
    [emailLower]
  );
  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  // Hash password and insert user inside a transaction/sequential calls
  const passwordHash = hashPassword(registerData.password);

  try {
    // Insert user
    const user = await queryOne<{ id: string; email: string }>(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [emailLower, passwordHash]
    );

    if (!user) {
      return { error: "Registration failed. Please try again." };
    }

    // Set role to customer
    await sql("INSERT INTO user_roles (user_id, role) VALUES ($1, $2)", [
      user.id,
      "customer",
    ]);

    // Create automatically active session
    await setSession({
      userId: user.id,
      email: user.email,
      role: "customer",
    });
  } catch (err) {
    console.error("Register error:", err);
    return { error: "Registration failed. Please try again." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
