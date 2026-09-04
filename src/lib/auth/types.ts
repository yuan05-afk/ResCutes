import type { Role } from "@/lib/auth/permissions";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
}

export interface AppSession {
  user: AppUser;
}
