import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  shelterCapabilities,
  shelterCapacity,
  shelters,
  userRoles,
  users,
} from "@/db/schema";
import { shelterIdForSlug, userIdForEmail } from "@/db/stable-ids";
import { AUTH_DEMO_USERS } from "@/lib/auth/demo-users";
import { buildOperationalDemoShelters } from "@/lib/data/operational-shelters";

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

async function seedUsers() {
  const db = getDb();

  for (const account of AUTH_DEMO_USERS) {
    const userId = userIdForEmail(account.email);
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

    if (!existing) {
      await db.insert(users).values({
        id: userId,
        email: account.email,
        name: account.name,
        phone: account.phone,
        passwordHash: null,
      });
      console.log(`Inserted app user: ${account.email}`);
    } else {
      await db
        .update(users)
        .set({
          name: account.name,
          phone: account.phone,
          updatedAt: new Date(),
        })
        .where(eq(users.email, account.email));
    }

    for (const role of account.roles) {
      await db
        .insert(userRoles)
        .values({ userId: existing?.id ?? userId, role })
        .onConflictDoNothing();
    }
  }
}

async function seedShelters() {
  const db = getDb();
  const operational = buildOperationalDemoShelters();

  for (const shelter of operational) {
    const id = shelterIdForSlug(shelter.id);

    const existing = await db.query.shelters.findFirst({
      where: eq(shelters.id, id),
      columns: { id: true },
    });

    if (!existing) {
      await db.insert(shelters).values({
        id,
        name: shelter.name,
        address: shelter.address,
        latitude: shelter.latitude,
        longitude: shelter.longitude,
        phone: shelter.phone || null,
        email: shelter.email || null,
        speciesAccepted: shelter.speciesAccepted,
        isActive: true,
      });
      console.log(`Inserted shelter: ${shelter.name}`);
    } else {
      await db
        .update(shelters)
        .set({
          name: shelter.name,
          address: shelter.address,
          latitude: shelter.latitude,
          longitude: shelter.longitude,
          phone: shelter.phone || null,
          email: shelter.email || null,
          speciesAccepted: shelter.speciesAccepted,
          updatedAt: new Date(),
        })
        .where(eq(shelters.id, id));
    }

    const capacity = await db.query.shelterCapacity.findFirst({
      where: eq(shelterCapacity.shelterId, id),
    });

    if (!capacity) {
      await db.insert(shelterCapacity).values({
        shelterId: id,
        totalCapacity: shelter.totalCapacity,
        currentOccupancy: shelter.currentOccupancy,
        operationalWorkload: shelter.operationalWorkload,
      });
    } else {
      await db
        .update(shelterCapacity)
        .set({
          totalCapacity: shelter.totalCapacity,
          currentOccupancy: shelter.currentOccupancy,
          operationalWorkload: shelter.operationalWorkload,
          updatedAt: new Date(),
        })
        .where(eq(shelterCapacity.shelterId, id));
    }

    await db
      .delete(shelterCapabilities)
      .where(eq(shelterCapabilities.shelterId, id));

    if (shelter.capabilities.length > 0) {
      await db.insert(shelterCapabilities).values(
        shelter.capabilities.map((capability) => ({
          shelterId: id,
          capability,
        })),
      );
    }
  }
}

async function seed() {
  await seedUsers();
  await seedShelters();
  console.log("ResCutes seed complete.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
