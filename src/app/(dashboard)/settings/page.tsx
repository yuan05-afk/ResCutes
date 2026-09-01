import { getShelters } from "@/lib/data/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShelterSettingsForm } from "./shelter-form";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";

export default function SettingsPage() {
  const shelters = getShelters();

  return (
    <PageShell>
      <DashboardHeader
        title="Settings"
        subtitle="Shelter capacity and capability configuration"
      />

      <div className="space-y-6">
        {shelters.map((shelter) => (
          <Card key={shelter.id}>
            <CardHeader>
              <CardTitle>{shelter.name}</CardTitle>
              <p className="text-sm text-graphite/55">{shelter.address}</p>
            </CardHeader>
            <CardContent>
              <ShelterSettingsForm shelter={shelter} />
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
