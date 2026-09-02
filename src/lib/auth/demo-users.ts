import type { Role } from "@/lib/auth/permissions";

/** Lightweight user list for auth. Kept separate from demo-store for Edge middleware. */
export interface AuthDemoUser {
  id: string;
  email: string;
  name: string;
  password: string;
  roles: Role[];
}

export const AUTH_DEMO_USERS: AuthDemoUser[] = [
  {
    id: "user-maria-citizen",
    email: "citizen@rescutes.demo",
    name: "Maria Santos",
    password: "demo1234",
    roles: ["citizen"],
  },
  {
    id: "user-james-rescuer",
    email: "rescuer@rescutes.demo",
    name: "James Chen",
    password: "demo1234",
    roles: ["rescuer"],
  },
  {
    id: "user-sarah-staff",
    email: "staff@rescutes.demo",
    name: "Sarah Lim",
    password: "demo1234",
    roles: ["shelter_staff"],
  },
  {
    id: "user-anita-vet",
    email: "vet@rescutes.demo",
    name: "Dr. Anita Rao",
    password: "demo1234",
    roles: ["veterinarian"],
  },
  {
    id: "user-alex-admin",
    email: "admin@rescutes.demo",
    name: "Alex Wong",
    password: "demo1234",
    roles: ["administrator"],
  },
  {
    id: "user-rescuer-2",
    email: "rescuer2@rescutes.demo",
    name: "Priya Nair",
    password: "demo1234",
    roles: ["rescuer"],
  },
  {
    id: "user-rescuer-3",
    email: "rescuer3@rescutes.demo",
    name: "Tom Bradley",
    password: "demo1234",
    roles: ["rescuer"],
  },
  {
    id: "user-rescuer-4",
    email: "rescuer4@rescutes.demo",
    name: "Lisa Koh",
    password: "demo1234",
    roles: ["rescuer"],
  },
  {
    id: "user-rescuer-5",
    email: "rescuer5@rescutes.demo",
    name: "David Tan",
    password: "demo1234",
    roles: ["rescuer"],
  },
];

export function findAuthUser(email: string, password: string): AuthDemoUser | undefined {
  const normalized = email.trim().toLowerCase();
  return AUTH_DEMO_USERS.find(
    (u) => u.email === normalized && u.password === password,
  );
}
