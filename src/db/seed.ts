/**
 * Seeds Neon Auth demo users + app role rows in Postgres.
 * Run: npm run db:seed
 */
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, userRoles } from "@/db/schema";
import { AUTH_DEMO_USERS } from "@/lib/auth/demo-users";

const AUTH_ORIGIN = process.env.SEED_AUTH_ORIGIN ?? "http://localhost:3000";

async function signUpNeonAuthUser(account: {
  email: string;
  password: string;
  name: string;
}) {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEON_AUTH_BASE_URL is not set");
  }

  const response = await fetch(`${baseUrl}/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: AUTH_ORIGIN,
    },
    body: JSON.stringify({
      email: account.email,
      password: account.password,
      name: account.name,
    }),
  });

  if (response.ok) {
    return { created: true as const };
  }

  const body = await response.text();
  if (response.status === 422 || body.toLowerCase().includes("already")) {
    return { created: false as const, exists: true as const };
  }

  return { created: false as const, error: body || response.statusText };
}

async function seed() {
  const db = getDb();

  for (const account of AUTH_DEMO_USERS) {
    const result = await signUpNeonAuthUser(account);

    if (result.created) {
      console.log(`Created Neon Auth user: ${account.email}`);
    } else if ("exists" in result && result.exists) {
      console.log(`Neon Auth user exists: ${account.email}`);
    } else if ("error" in result) {
      console.warn(`Neon Auth user ${account.email}: ${result.error}`);
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.email, account.email),
      columns: { id: true },
    });

    let userId = existing?.id;

    if (!userId) {
      const [inserted] = await db
        .insert(users)
        .values({
          email: account.email,
          name: account.name,
          passwordHash: null,
        })
        .returning({ id: users.id });
      userId = inserted.id;
      console.log(`Inserted app user: ${account.email}`);
    }

    for (const role of account.roles) {
      await db
        .insert(userRoles)
        .values({ userId, role })
        .onConflictDoNothing();
    }
  }

  console.log("ResCutes seed complete.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
