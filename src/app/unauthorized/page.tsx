import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/status/state-message";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bone px-4">
      <div className="text-center">
        <StateMessage
          type="denied"
          title="Access denied"
          message="You don't have permission to view this page."
        />
        <div className="mt-4 flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
