import { requireAuth } from "@/lib/auth/session";
import { getUserProfilePrefs } from "@/lib/data/user-profile";
import { ReportFlow } from "./report-flow";

export default async function ReportPage() {
  const session = await requireAuth();
  const prefs = await getUserProfilePrefs(session.user.id);

  return <ReportFlow initialPhone={prefs.phone ?? ""} />;
}
