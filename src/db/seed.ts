/**
 * Seeds Neon Auth demo users + app role rows.
 * Run: npm run db:seed
 */
import { eq } from "drizzle-orm";
import { HexclaveServerApp } from "@hexclave/next";
import { getDb } from "@/db";
import { users, userRoles } from "@/db/schema";
import { AUTH_DEMO_USERS } from "@/lib/auth/demo-users";
import { hexclaveClientApp } from "@/stack/client";

const hexclaveServerApp = new HexclaveServerApp({
  inheritsFrom: hexclaveClientApp,
});

async function seed() {
  const db = getDb();

  for (const account of AUTH_DEMO_USERS) {
    try {
      await hexclaveServerApp.createUser({
        primaryEmail: account.email,
        password: account.password,
        displayName: account.name,
        primaryEmailVerified: true,
        primaryEmailAuthEnabled: true,
        serverMetadata: {
          roles: account.roles,
          demoUserId: account.id,
        },
      });
      console.log(`Created Neon Auth user: ${account.email}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes("already")) {
        console.log(`Neon Auth user exists: ${account.email}`);
      } else {
        console.warn(`Neon Auth user ${account.email}: ${message}`);
      }
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
