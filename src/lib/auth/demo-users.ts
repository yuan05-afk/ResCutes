import type { Role } from "@/lib/auth/permissions";
import { userIdForEmail } from "@/db/stable-ids";

export interface AuthDemoUser {
  id: string;
  email: string;
  name: string;
  password: string;
  roles: Role[];
}

const DEMO_ACCOUNT_DEFS = [
  {
    email: "citizen@rescutes.demo",
    name: "Maria Santos",
    password: "demo1234",
    roles: ["citizen"] as Role[],
  },
  {
    email: "rescuer@rescutes.demo",
    name: "James Chen",
    password: "demo1234",
    roles: ["rescuer"] as Role[],
  },
  {
    email: "staff@rescutes.demo",
    name: "Sarah Lim",
    password: "demo1234",
    roles: ["shelter_staff"] as Role[],
  },
  {
    email: "vet@rescutes.demo",
    name: "Dr. Anita Rao",
    password: "demo1234",
    roles: ["veterinarian"] as Role[],
  },
  {
    email: "admin@rescutes.demo",
    name: "Alex Wong",
    password: "demo1234",
    roles: ["administrator"] as Role[],
  },
  {
    email: "rescuer2@rescutes.demo",
    name: "Priya Nair",
    password: "demo1234",
    roles: ["rescuer"] as Role[],
  },
  {
    email: "rescuer3@rescutes.demo",
    name: "Tom Bradley",
    password: "demo1234",
    roles: ["rescuer"] as Role[],
  },
  {
    email: "rescuer4@rescutes.demo",
    name: "Lisa Koh",
    password: "demo1234",
    roles: ["rescuer"] as Role[],
  },
  {
    email: "rescuer5@rescutes.demo",
    name: "David Tan",
    password: "demo1234",
    roles: ["rescuer"] as Role[],
  },
] as const;

export const AUTH_DEMO_USERS: AuthDemoUser[] = DEMO_ACCOUNT_DEFS.map(
  (account) => ({
    ...account,
    id: userIdForEmail(account.email),
  }),
);
