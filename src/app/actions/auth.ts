"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/server";

export async function signOutAction() {
  await neonAuth.signOut();
  redirect("/login");
}
