import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <Button type="submit" variant="outline" className="w-full rounded-full h-12">
        Sign Out
      </Button>
    </form>
  );
}
