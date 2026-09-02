import { DEMO_USERS } from "@/lib/data/demo-store";

export interface UserProfilePrefs {
  userId: string;
  phone: string;
  department: string;
  notifyEmail: boolean;
  notifyUrgentCases: boolean;
  notifyAssignments: boolean;
  notifyWeeklyDigest: boolean;
  timezone: string;
}

const DEFAULT_TIMEZONE = "Asia/Manila";

const SEED_PROFILES: UserProfilePrefs[] = DEMO_USERS.map((u) => ({
  userId: u.id,
  phone: u.phone ?? "",
  department: "",
  notifyEmail: true,
  notifyUrgentCases: true,
  notifyAssignments: true,
  notifyWeeklyDigest: false,
  timezone: DEFAULT_TIMEZONE,
}));

function bindGlobalMutable<T>(globalKey: string, seed: T): T {
  const store = globalThis as typeof globalThis & Record<string, T | undefined>;
  if (!store[globalKey]) {
    store[globalKey] = seed;
  }
  return store[globalKey]!;
}

const PROFILE_STORE = bindGlobalMutable<UserProfilePrefs[]>(
  "__rescutes_user_profiles",
  SEED_PROFILES,
);

export function getUserProfilePrefs(userId: string): UserProfilePrefs {
  const existing = PROFILE_STORE.find((p) => p.userId === userId);
  if (existing) return { ...existing };

  const seeded = SEED_PROFILES.find((p) => p.userId === userId);
  if (seeded) return { ...seeded };

  return {
    userId,
    phone: "",
    department: "",
    notifyEmail: true,
    notifyUrgentCases: true,
    notifyAssignments: true,
    notifyWeeklyDigest: false,
    timezone: DEFAULT_TIMEZONE,
  };
}

export function updateUserProfilePrefs(
  userId: string,
  patch: Partial<Omit<UserProfilePrefs, "userId">>,
): UserProfilePrefs {
  const idx = PROFILE_STORE.findIndex((p) => p.userId === userId);
  const base =
    idx >= 0
      ? PROFILE_STORE[idx]
      : SEED_PROFILES.find((p) => p.userId === userId) ?? {
          userId,
          phone: "",
          department: "",
          notifyEmail: true,
          notifyUrgentCases: true,
          notifyAssignments: true,
          notifyWeeklyDigest: false,
          timezone: DEFAULT_TIMEZONE,
        };

  const updated = { ...base, ...patch, userId };
  if (idx >= 0) {
    PROFILE_STORE[idx] = updated;
  } else {
    PROFILE_STORE.push(updated);
  }
  return updated;
}
