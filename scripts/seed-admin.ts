import { Pool } from "@neondatabase/serverless";
import { hashPassword } from "../lib/auth/password";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL is missing in .env.local");
  process.exit(1);
}

async function seed() {
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const email = "admin@nfcin.id";
  const password = "Password123";
  const hashedPassword = hashPassword(password);

  console.log(`Checking if admin user (${email}) already exists...`);
  
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  let userId: string;

  if (existingUser.rows.length > 0) {
    console.log("Admin user already exists in users table.");
    userId = existingUser.rows[0].id;
  } else {
    console.log("Inserting new admin user...");
    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
      [email, hashedPassword]
    );
    userId = newUser.rows[0].id;
    console.log("Admin user inserted successfully.");
  }

  // Ensure role is admin
  console.log("Checking admin role in user_roles...");
  const existingRole = await pool.query(
    "SELECT role FROM user_roles WHERE user_id = $1",
    [userId]
  );

  if (existingRole.rows.length > 0) {
    if (existingRole.rows[0].role !== "admin") {
      console.log("Updating role to admin...");
      await pool.query(
        "UPDATE user_roles SET role = 'admin' WHERE user_id = $1",
        [userId]
      );
    } else {
      console.log("User already has admin role.");
    }
  } else {
    console.log("Creating admin role record...");
    await pool.query(
      "INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')",
      [userId]
    );
  }

  console.log("\n==================================================");
  console.log("Admin Seed Successful!");
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log("==================================================");

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
