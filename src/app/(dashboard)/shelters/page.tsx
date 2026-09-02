import {
  DashboardHeader,
  PageShell,
} from "@/components/layout/dashboard-header";
import { SheltersMapWorkspace } from "@/components/shelters/shelters-map-workspace";
import { getPhilippinesShelterDirectory } from "@/lib/data/philippines-shelters-directory";

export default function SheltersPage() {
  const shelters = getPhilippinesShelterDirectory();
  const verifiedCount = shelters.filter((s) => s.source === "verified").length;
  const osmCount = shelters.filter((s) => s.source === "osm").length;

  return (
    <PageShell
      fitViewport
      header={
        <DashboardHeader
          title="Philippines Shelter Map"
          subtitle={`${shelters.length} shelters · ${verifiedCount} verified listings · ${osmCount} OpenStreetMap pins`}
          compact={false}
        />
      }
      className="flex min-h-0 flex-1 flex-col lg:overflow-hidden"
    >
      <SheltersMapWorkspace shelters={shelters} />
    </PageShell>
  );
}
