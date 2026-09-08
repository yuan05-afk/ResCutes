import { redirect } from "next/navigation";

/** Alias for /login (bookmark / typo compatibility). */
export default function SignInAliasPage() {
  redirect("/login");
}
